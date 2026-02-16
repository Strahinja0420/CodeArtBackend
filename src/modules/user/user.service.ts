import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';

import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async findAll() {
    return await this.prismaService.user.findMany({
      include: {
        experiences: true,
        qrStyle: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id },
      include: {
        experiences: true,
        qrStyle: true,
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const { qrStyle, ...userData } = data;

    if (userData.name || userData.avatarURL) {
      const { error } =
        await this.supabaseService.admin.auth.admin.updateUserById(id, {
          user_metadata: {
            ...(userData.name && { name: userData.name }),
            ...(userData.avatarURL && { avatar_url: userData.avatarURL }),
          },
        });

      if (error) {
        throw new Error(`Failed to update user in Supabase: ${error.message}`);
      }
    }

    return await this.prismaService.user.update({
      where: { id },
      data: {
        ...userData,
        qrStyle: qrStyle
          ? {
              upsert: {
                create: {
                  config: qrStyle.config || {},
                  name: `${userData.name ?? 'User'}'s Style`,
                  logoURL: qrStyle.logoURL,
                },
                update: qrStyle,
              },
            }
          : undefined,
      },
      include: { qrStyle: true, experiences: true },
    });
  }

  async remove(id: string) {
    const { error } =
      await this.supabaseService.admin.auth.admin.deleteUser(id);

    if (error) {
      throw new Error(`Failed to delete user from Supabase: ${error.message}`);
    }

    return await this.prismaService.user.delete({
      where: { id },
    });
  }
}
