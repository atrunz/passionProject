import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import { verifyToken } from "@clerk/backend";
import { PrismaService } from "../prisma/prisma.service";

export type RequestLike = {
  headers: {
    authorization?: string;
  };
};

type ClerkClaims = {
  sub: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
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

      return this.getDevUser(defaultRole);
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

  private getBearerToken(request: RequestLike) {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    return authorization.slice("Bearer ".length).trim();
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

    const existing = await this.prisma.user.findUnique({
      where: {
        clerkUserId: claims.sub
      }
    });

    return this.prisma.user.upsert({
      where: {
        clerkUserId: claims.sub
      },
      update: {
        email,
        name,
        role: existing?.role === "ORGANIZER" ? "ORGANIZER" : defaultRole
      },
      create: {
        clerkUserId: claims.sub,
        email,
        name,
        role: defaultRole
      }
    });
  }
}
