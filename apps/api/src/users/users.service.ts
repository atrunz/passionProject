import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateMeDto } from "./dto/update-me.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  getProfile(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async updateProfile(user: User, dto: UpdateMeDto) {
    const updated = await this.prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        name: dto.name?.trim() || user.name,
        role: dto.role ?? user.role
      }
    });

    return this.getProfile(updated);
  }
}
