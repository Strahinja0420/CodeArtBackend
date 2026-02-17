import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Experience } from './entities/experience.entity';
import { User } from 'src/modules/user/entities/user.entity';

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
