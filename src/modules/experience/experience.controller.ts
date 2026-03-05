import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseFilePipeBuilder,
  ForbiddenException,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ExperienceService } from './experience.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { CurrentUser } from 'src/decorators/user.decorator';
import { User } from 'src/modules/user/entities/user.entity';
import { Experience } from './entities/experience.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { Public } from 'src/decorators/public.decorator';
import { SupabaseService } from 'src/supabase/supabase.service';

@ApiTags('experience')
@ApiBearerAuth()
@UseGuards(ThrottlerGuard, JwtAuthGuard)
@Controller('experience')
export class ExperienceController {
  constructor(
    private readonly experienceService: ExperienceService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @ApiOperation({ summary: 'Create a new experience' })
  @ApiCreatedResponse({ type: Experience })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        storageLocation: { type: 'string' },
        material: { type: 'string' },
        period: { type: 'string' },
        author: { type: 'string' },
        yearCreated: { type: 'integer' },
        category: { type: 'string' },
        thumbnail: { type: 'string', format: 'binary' },
        audio: { type: 'string', format: 'binary' },
        model: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
      { name: 'model', maxCount: 1 },
    ]),
  )
  async create(
    @Body() data: CreateExperienceDto,
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      audio?: Express.Multer.File[];
      model?: Express.Multer.File[];
    },
  ) {
    const newExperience = await this.experienceService.create(data, user.id, {
      thumbnail: files.thumbnail?.[0],
      audio: files.audio?.[0],
      model: files.model?.[0],
    });

    return {
      message: 'Experience successfully created',
      data: newExperience,
    };
  }

  @ApiOperation({ summary: 'Returns all data about all experiences' })
  @Get()
  async findAll() {
    const experiences = await this.experienceService.findAll();

    return {
      message: 'Successful experiences query.',
      data: experiences,
    };
  }

  @ApiOperation({ summary: 'Find current users experiences' })
  @ApiOkResponse({ type: Experience })
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
  @ApiOkResponse({ type: Experience })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const specificExperience = await this.experienceService.findOne(id);

    return {
      message: `Successfully fetched experience with id ${id}`,
      data: specificExperience,
    };
  }

  @ApiOperation({ summary: 'Update specific experience' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateExperienceDto,
    @CurrentUser() user: User,
  ) {
    const updatedExperience = await this.experienceService.update(
      id,
      data,
      user,
    );

    return {
      message: `Experience with the id:${id} successfully updated`,
      data: updatedExperience,
    };
  }

  @ApiOperation({ summary: 'Delete specific experience' })
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const deletedExperience = await this.experienceService.remove(id, user);

    return {
      message: `Experience with the id:${id} successfully deleted`,
      data: deletedExperience,
    };
  }

  @ApiOperation({ summary: 'Upload a thumbnail for an experience' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/thumbnail')
  async uploadThumbnail(
    @CurrentUser() user: User,
    @Param('id') experienceId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(jpg|jpeg|png)$',
        })
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    thumbnail: Express.Multer.File,
  ) {
    const path = `${experienceId}/thumbnail-${Date.now()}`;
    const thumbnailUrl = await this.supabaseService.uploadFile(
      thumbnail,
      'thumbnails',
      path,
    );

    await this.experienceService.update(
      experienceId,
      { thumbnailURL: thumbnailUrl },
      user,
    );

    return {
      message: 'Thumbnail uploaded successfully',
      url: thumbnailUrl,
    };
  }

  @ApiOperation({ summary: 'Upload an audio file for an experience' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/audio')
  async uploadMp3(
    @CurrentUser() user: User,
    @Param('id') experienceId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'audio/mpeg',
        })
        .addMaxSizeValidator({
          maxSize: 20 * 1024 * 1024,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    audio: Express.Multer.File,
  ) {
    const path = `${experienceId}/audio-${Date.now()}`;
    const audioUrl = await this.supabaseService.uploadFile(
      audio,
      'audios',
      path,
    );

    await this.experienceService.update(
      experienceId,
      { audioLocation: audioUrl },
      user,
    );

    return {
      message: 'Audio uploaded successfully',
      url: audioUrl,
    };
  }

  @ApiOperation({ summary: '3D Model uploaded successfully' })
  @Post(':id/model')
  async uploadModel(
    @CurrentUser() user: User,
    @Param('id') experienceId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /\.(glb|gltf)$/,
        })
        .addMaxSizeValidator({
          maxSize: 50 * 1024 * 1024,
        })
        .build({
          fileIsRequired: true,
        }),
    )
    model: Express.Multer.File,
  ) {
    const path = `${experienceId}/model-${Date.now()}`;
    const modelUrl = await this.supabaseService.uploadFile(
      model,
      'models',
      path,
    );

    await this.experienceService.update(
      experienceId,
      { storageLocation: modelUrl },
      user,
    );

    return {
      message: '3D Model uploaded successfully',
      url: modelUrl,
    };
  }

  @ApiOperation({ summary: 'Regenerate QR code for an experience' })
  @Post(':id/qr-code/regenerate')
  async regenerateQRCode(
    @CurrentUser() user: User,
    @Param('id') experienceId: string,
  ) {
    const experience = await this.experienceService.findOne(experienceId);
    if (experience.userId !== user.id) {
      throw new ForbiddenException('You cannot change this experience.');
    }

    const qrCodeUrl = await this.experienceService.generateQRCode(
      experienceId,
      user.id,
    );

    return {
      message: 'QR Code regenerated successfully',
      url: qrCodeUrl,
    };
  }
}
