import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ExperienceService } from './experience.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { CurrentUser } from 'src/decorators/user.decorator';
import { User } from 'src/modules/user/entities/user.entity';
import { Experience } from './entities/experience.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('experience')
@ApiBearerAuth()
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@Controller('experience')
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @ApiOperation({ summary: 'Create a new experience' })
  @Post()
  async create(@Body() data: CreateExperienceDto, @CurrentUser() user: User) {
    const newExperience = await this.experienceService.create(data, user.id);

    return {
      message: 'Experience succesfully created',
      data: newExperience,
    };
  }

  @ApiOperation({ summary: 'Returns all data about all experiences' })
  @Get()
  async findAll() {
    const experiences = await this.experienceService.findAll();

    return {
      message: 'Succesfull experiences query.',
      data: experiences,
    };
  }

  @ApiOperation({ summary: 'Find current users experiences' })
  @Get('me')
  async findMe(@CurrentUser() user: User) {
    const userExperiences = await this.experienceService.findMany(user.id);

    return {
      message: 'Successfully queried all users experiences',
      data: userExperiences,
    };
  }

  @ApiOperation({ summary: 'Find specific experience' })
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const specificExperience = await this.experienceService.findOne(id);

    return {
      message: `Succesfully fetched experience with id ${id}`,
      data: specificExperience,
    };
  }

  @ApiOperation({ summary: 'Update specific experience' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateExperienceDto) {
    const updatedExperience = await this.experienceService.update(id, data);

    return {
      message: `Experience with the id:${id} succesfully updated`,
      data: updatedExperience,
    };
  }

  @ApiOperation({ summary: 'Delete specific experience' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedExperience = this.experienceService.remove(id);

    return {
      message: `Experience with the id:${id} succesfully deleted`,
      data: deletedExperience,
    };
  }
}
