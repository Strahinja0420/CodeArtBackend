import { ForbiddenException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Experience } from './entities/experience.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class ExperienceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(
    data: CreateExperienceDto,
    userId: string,
    files?: {
      thumbnail?: Express.Multer.File;
      audio?: Express.Multer.File;
      model?: Express.Multer.File;
    },
  ): Promise<Experience> {
    const experienceData = { ...data };

    // Handle files if they exist
    if (files?.thumbnail || files?.audio || files?.model) {
      const tempId = crypto.randomUUID();

      if (files.thumbnail) {
        const thumbPath = `${tempId}/thumbnail-${Date.now()}`;
        experienceData.thumbnailURL = await this.supabaseService.uploadFile(
          files.thumbnail,
          'thumbnails',
          thumbPath,
        );
      }

      if (files.audio) {
        const audioPath = `${tempId}/audio-${Date.now()}`;
        experienceData.audioLocation = await this.supabaseService.uploadFile(
          files.audio,
          'audios',
          audioPath,
        );
      }

      if (files.model) {
        const modelPath = `${tempId}/model-${Date.now()}`;
        experienceData.storageLocation = await this.supabaseService.uploadFile(
          files.model,
          'models',
          modelPath,
        );
      }

      // Override the id with our pre-generated one so paths match
      return await this.prismaService.experience.create({
        data: {
          id: tempId,
          ...experienceData,
          user: { connect: { id: userId } },
        },
      });
    }

    return await this.prismaService.experience.create({
      data: {
        ...experienceData,
        user: { connect: { id: userId } },
      },
    });
  }

  async findMany(userId: string): Promise<Experience[]> {
    const userExperiences: Experience[] =
      await this.prismaService.experience.findMany({
        where: { userId },
        include: {
          feedbacks: true,
          translations: true,
          visits: true,
        },
      });

    return userExperiences;
  }

  async findAll(): Promise<Experience[]> {
    const experiences: Experience[] =
      await this.prismaService.experience.findMany();

    return experiences;
  }

  async findOne(id: string): Promise<Experience> {
    const specificExperience =
      await this.prismaService.experience.findUniqueOrThrow({
        where: { id },
      });

    return specificExperience;
  }

  async update(
    id: string,
    data: UpdateExperienceDto,
    user: User,
  ): Promise<Experience> {
    const experience = await this.findOne(id);

    if (experience.userId !== user.id) {
      throw new ForbiddenException('You cannot change this experience.');
    }

    return await this.prismaService.experience.update({
      where: { id },
      data: { ...data },
    });
  }

  async remove(id: string, user: User): Promise<Experience> {
    const experience = await this.findOne(id);

    if (experience.userId !== user.id) {
      throw new ForbiddenException('You cannot change this experience.');
    }

    return await this.prismaService.experience.delete({
      where: { id },
    });
  }
}
