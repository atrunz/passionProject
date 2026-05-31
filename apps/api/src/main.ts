import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import helmet from "helmet";
import { AppModule } from "./app.module";

function validateProductionConfig(config: ConfigService) {
  if (config.get<string>("NODE_ENV") !== "production") {
    return;
  }

  const requiredKeys = [
    "DATABASE_URL",
    "FRONTEND_URL",
    "API_PUBLIC_URL",
    "CLERK_SECRET_KEY",
    "STRIPE_SECRET_KEY"
  ];
  const missingKeys = requiredKeys.filter((key) => !config.get<string>(key));
  const authRequireClerk = config.get<string>("AUTH_REQUIRE_CLERK");
  const unsafeUrls = ["FRONTEND_URL", "API_PUBLIC_URL"].filter((key) => {
    const value = config.get<string>(key) ?? "";
    return value.includes("localhost") || value.includes("127.0.0.1");
  });

  if (authRequireClerk !== "true") {
    missingKeys.push("AUTH_REQUIRE_CLERK=true");
  }

  if (unsafeUrls.length > 0) {
    missingKeys.push(`${unsafeUrls.join(", ")} cannot point at localhost in production`);
  }

  if (missingKeys.length > 0) {
    throw new Error(`Production configuration is incomplete: ${missingKeys.join(", ")}`);
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  validateProductionConfig(config);
  const frontendUrl = config.get<string>("FRONTEND_URL", "http://localhost:3000");
  const uploadDir = config.get<string>("UPLOAD_DIR", join(process.cwd(), "uploads"));

  app.setGlobalPrefix("api/v1");
  mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(uploadDir, {
    prefix: "/uploads/"
  });
  app.use(helmet());
  app.enableCors({
    origin: frontendUrl,
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const port = config.get<number>("PORT", 4000);
  await app.listen(port);
}

void bootstrap();
