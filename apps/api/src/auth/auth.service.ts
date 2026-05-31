import { ForbiddenException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { PrismaService } from "../prisma/prisma.service";

export type RequestLike = {
  headers: {
    authorization?: string;
    "x-localshow-dev-role"?: string;
  };
};

type ClerkClaims = {
  sub: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  public_metadata?: {
    localshowRole?: string;
    role?: string;
  };
  private_metadata?: {
    localshowRole?: string;
    role?: string;
  };
  unsafe_metadata?: {
    localshowRole?: string;
    role?: string;
  };
};

export type AuthenticatedRole = "FAN" | "ORGANIZER";

const DEV_USERS: Record<AuthenticatedRole, { clerkUserId: string; email: string; name: string }> = {
  FAN: {
    clerkUserId: "seed_clerk_fan",
    email: "fan@localshow.test",
    name: "Demo Fan"
  },
  ORGANIZER: {
    clerkUserId: "seed_clerk_organizer",
    email: "organizer@localshow.test",
    name: "Demo Organizer"
  }
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  async resolveUser(request: RequestLike, defaultRole: AuthenticatedRole): Promise<User> {
    const token = this.getBearerToken(request);
    const secretKey = this.config.get<string>("CLERK_SECRET_KEY");
    const requireClerk = this.config.get<string>("AUTH_REQUIRE_CLERK") === "true";

    if (!token || !secretKey) {
      if (requireClerk) {
        throw new UnauthorizedException("Authentication required");
      }

      return this.getDevUser(this.getDevRole(request) ?? defaultRole);
    }

    try {
      const verified = (await verifyToken(token, {
        secretKey
      })) as ClerkClaims;

      return this.upsertClerkUser(verified, defaultRole);
    } catch {
      throw new UnauthorizedException("Invalid authentication token");
    }
  }

  ensureRole(user: User, allowedRoles: Array<"ORGANIZER" | "ADMIN">) {
    if (!allowedRoles.includes(user.role as "ORGANIZER" | "ADMIN")) {
      throw new ForbiddenException("You do not have permission to access this resource");
    }
  }

  async syncClerkRoleMetadata(user: User) {
    const secretKey = this.config.get<string>("CLERK_SECRET_KEY");

    if (!secretKey || user.clerkUserId.startsWith("seed_clerk_")) {
      return;
    }

    try {
      const clerk = createClerkClient({ secretKey });
      await clerk.users.updateUserMetadata(user.clerkUserId, {
        publicMetadata: {
          localshowRole: user.role
        }
      });
    } catch (error) {
      this.logger.warn(
        `Unable to sync Clerk role metadata for ${user.clerkUserId}: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      );
    }
  }

  private getBearerToken(request: RequestLike) {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    return authorization.slice("Bearer ".length).trim();
  }

  private getDevRole(request: RequestLike): AuthenticatedRole | null {
    const value = request.headers["x-localshow-dev-role"]?.toUpperCase();

    if (value === "FAN" || value === "ORGANIZER") {
      return value;
    }

    return null;
  }

  private async getDevUser(role: AuthenticatedRole) {
    const user = DEV_USERS[role];

    return this.prisma.user.upsert({
      where: {
        email: user.email
      },
      update: {
        role
      },
      create: {
        ...user,
        role
      }
    });
  }

  private async upsertClerkUser(claims: ClerkClaims, defaultRole: AuthenticatedRole) {
    const name =
      claims.name ??
      ([claims.first_name, claims.last_name].filter(Boolean).join(" ").trim() || null);
    const email = claims.email ?? `${claims.sub}@clerk.localshow`;
    const metadataRole = this.getRoleFromClerkMetadata(claims);

    const existing = await this.prisma.user.findUnique({
      where: {
        clerkUserId: claims.sub
      }
    });

    if (!existing) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: {
          email
        }
      });

      if (existingByEmail?.clerkUserId.startsWith("pending_transfer_")) {
        return this.prisma.user.update({
          where: {
            id: existingByEmail.id
          },
          data: {
            clerkUserId: claims.sub,
            email,
            name,
            role: existingByEmail.role ?? metadataRole ?? defaultRole
          }
        });
      }
    }

    return this.prisma.user.upsert({
      where: {
        clerkUserId: claims.sub
      },
      update: {
        email,
        name,
        role: existing?.role ?? metadataRole ?? defaultRole
      },
      create: {
        clerkUserId: claims.sub,
        email,
        name,
        role: metadataRole ?? defaultRole
      }
    });
  }

  private getRoleFromClerkMetadata(claims: ClerkClaims): AuthenticatedRole | null {
    const role =
      claims.public_metadata?.localshowRole ??
      claims.public_metadata?.role ??
      claims.private_metadata?.localshowRole ??
      claims.private_metadata?.role ??
      claims.unsafe_metadata?.localshowRole ??
      claims.unsafe_metadata?.role;

    if (role === "FAN" || role === "ORGANIZER") {
      return role;
    }

    return null;
  }
}
