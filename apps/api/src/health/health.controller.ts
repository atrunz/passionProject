import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { PrismaService } from "../prisma/prisma.service";

type ReadinessCheck = {
  key: string;
  label: string;
  status: "READY" | "WARNING" | "BLOCKED";
  detail: string;
};

@Controller("health")
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHealth() {
    return {
      status: "ok",
      service: "localshow-api",
      timestamp: new Date().toISOString()
    };
  }

  @Get("readiness")
  async getReadiness() {
    const checks: ReadinessCheck[] = [
      await this.checkDatabase(),
      await this.checkUploadDirectory(),
      this.checkRequiredUrl("FRONTEND_URL", "Frontend URL"),
      this.checkRequiredUrl("API_PUBLIC_URL", "Public API URL"),
      this.checkAuthMode(),
      this.checkSecret("CLERK_SECRET_KEY", "Clerk auth", true),
      this.checkSecret("STRIPE_SECRET_KEY", "Stripe payments", true),
      this.checkSecret("OPENAI_API_KEY", "OpenAI event copy", false)
    ];
    const blockedCount = checks.filter((check) => check.status === "BLOCKED").length;
    const warningCount = checks.filter((check) => check.status === "WARNING").length;

    return {
      status: blockedCount > 0 ? "BLOCKED" : warningCount > 0 ? "WARNING" : "READY",
      service: "localshow-api",
      environment: this.config.get<string>("NODE_ENV", "development"),
      checkedAt: new Date().toISOString(),
      checks
    };
  }

  private async checkDatabase(): Promise<ReadinessCheck> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        key: "database",
        label: "PostgreSQL database",
        status: "READY",
        detail: "Database connection succeeded"
      };
    } catch {
      return {
        key: "database",
        label: "PostgreSQL database",
        status: "BLOCKED",
        detail: "Database connection failed"
      };
    }
  }

  private async checkUploadDirectory(): Promise<ReadinessCheck> {
    const uploadDir = this.config.get<string>("UPLOAD_DIR", join(process.cwd(), "uploads"));

    try {
      await access(uploadDir, constants.R_OK | constants.W_OK);

      return {
        key: "uploads",
        label: "Upload storage",
        status: "READY",
        detail: "Upload directory is readable and writable"
      };
    } catch {
      return {
        key: "uploads",
        label: "Upload storage",
        status: "WARNING",
        detail: "Upload directory is not currently readable and writable"
      };
    }
  }

  private checkRequiredUrl(key: string, label: string): ReadinessCheck {
    const value = this.config.get<string>(key);
    const isProduction = this.config.get<string>("NODE_ENV") === "production";
    const isLocalhost = Boolean(value?.includes("localhost") || value?.includes("127.0.0.1"));

    return {
      key,
      label,
      status: value && (!isProduction || !isLocalhost) ? "READY" : "BLOCKED",
      detail: !value
        ? `${key} must be configured before deployment`
        : isProduction && isLocalhost
          ? `${key} cannot point at localhost in production`
          : "Configured"
    };
  }

  private checkAuthMode(): ReadinessCheck {
    const isProduction = this.config.get<string>("NODE_ENV") === "production";
    const requireClerk = this.config.get<string>("AUTH_REQUIRE_CLERK") === "true";

    return {
      key: "AUTH_REQUIRE_CLERK",
      label: "Auth enforcement",
      status: !isProduction || requireClerk ? "READY" : "BLOCKED",
      detail:
        !isProduction || requireClerk
          ? "Configured"
          : "AUTH_REQUIRE_CLERK must be true in production"
    };
  }

  private checkSecret(key: string, label: string, requiredForLaunch: boolean): ReadinessCheck {
    const value = this.config.get<string>(key);

    if (value) {
      return {
        key,
        label,
        status: "READY",
        detail: "Configured"
      };
    }

    return {
      key,
      label,
      status: requiredForLaunch ? "BLOCKED" : "WARNING",
      detail: requiredForLaunch
        ? `${label} must be configured before paid production launch`
        : `${label} will use fallback behavior until configured`
    };
  }
}
