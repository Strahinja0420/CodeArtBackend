import { Injectable } from '@nestjs/common';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Experience } from './entities/experience.entity';

@Injectable()
export class ExperienceService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateExperienceDto, userId: string): Promise<Experience> {
    const experience: Experience = await this.prismaService.experience.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });

    return experience;
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

  async update(id: string, data: UpdateExperienceDto): Promise<Experience> {
    const updatedExperience: Experience =
      await this.prismaService.experience.update({
        where: { id },
        data: { ...data },
      });

    return updatedExperience;
  }

  async remove(id: string): Promise<Experience> {
    const deletedExperience: Experience =
      await this.prismaService.experience.delete({ where: { id } });

    return deletedExperience;
  }
}
