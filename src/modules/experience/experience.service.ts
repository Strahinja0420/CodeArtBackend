import { ForbiddenException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Experience } from './entities/experience.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { SupabaseService } from 'src/supabase/supabase.service';
import { QrServiceService } from 'src/qr-service/qr-service.service';

@Injectable()
export class ExperienceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly supabaseService: SupabaseService,
    private readonly qrServiceService: QrServiceService,
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
    const tempId = crypto.randomUUID();

    // Handle files if they exist
    if (files?.thumbnail || files?.audio || files?.model) {
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
    }

    // Create the experience first
    const experience = await this.prismaService.experience.create({
      data: {
        id: tempId,
        ...experienceData,
        user: { connect: { id: userId } },
      },
    });

    // Generate QR Code
    const qrCodeUrl = await this.generateQRCode(experience.id, userId);

    // Update experience with QR Code URL
    return await this.prismaService.experience.update({
      where: { id: experience.id },
      data: { QRcodeUrl: qrCodeUrl },
    });
  }

  async generateQRCode(experienceId: string, userId: string): Promise<string> {
    const userWithStyle = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { qrStyle: true },
    });

    const config = (userWithStyle?.qrStyle?.config as any) || {};
    const logoURL = userWithStyle?.qrStyle?.logoURL;

    const qrCodeUrl = await this.qrServiceService.generateQRCode(experienceId, {
      ...config,
      logoURL,
    });

    return qrCodeUrl;
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

    return userExperiences.map((exp: any) => {
      const avg =
        exp.feedbacks.length > 0
          ? exp.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
            exp.feedbacks.length
          : 0;
      return {
        ...exp,
        averageRating: parseFloat(avg.toFixed(1)),
        feedbackCount: exp.feedbacks.length,
      };
    });
  }

  async findAll(): Promise<any[]> {
    const experiences = await this.prismaService.experience.findMany({
      include: {
        feedbacks: true,
      },
    });

    return experiences.map((exp) => {
      const avg =
        exp.feedbacks.length > 0
          ? exp.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
            exp.feedbacks.length
          : 0;
      return {
        ...exp,
        averageRating: parseFloat(avg.toFixed(1)),
        feedbackCount: exp.feedbacks.length,
      };
    });
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

  async recordScan(
    experienceId: string,
    metadata: { language: any; deviceType: any },
  ): Promise<void> {
    await this.prismaService.experience.update({
      where: { id: experienceId },
      data: {
        scanCount: { increment: 1 },
      },
    });

    await this.prismaService.visit.create({
      data: {
        experienceId,
        language: metadata.language || 'EN',
        deviceType: metadata.deviceType || 'MOBILE',
        timestamp: new Date(),
      },
    });
  }

  async addFeedback(
    experienceId: string,
    data: { rating: number; comment?: string },
  ) {
    return await this.prismaService.feedback.create({
      data: {
        experienceId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }
}
