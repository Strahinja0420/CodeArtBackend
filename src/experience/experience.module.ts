import { Module } from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { ExperienceController } from './experience.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  controllers: [ExperienceController],
  providers: [ExperienceService, PrismaService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
