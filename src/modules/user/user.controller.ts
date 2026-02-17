import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  UnauthorizedException,
  UseInterceptors,
  Post,
  UploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserWithRelations } from './entities/user-with-relations.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/supabase/supabase.service';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @ApiOperation({ summary: 'Get all existing users' })
  @Get()
  async findAll(): Promise<UserWithRelations[]> {
    const users = await this.userService.findAll();

    if (!users) {
      throw new NotFoundException('There are no users in the database');
    }

    return users;
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserWithRelations })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMe(@CurrentUser() user: User): Promise<UserWithRelations> {
    const foundUser = await this.userService.findOne(user.id);
    if (!foundUser) {
      throw new NotFoundException('User profile not found');
    }
    return foundUser;
  }

  @ApiOperation({ summary: 'Find specific user' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserWithRelations> {
    const user = await this.userService.findOne(id);

    if (!user) {
      throw new NotFoundException(
        `The user with id: ${id} has not been found.`,
      );
    }

    return user;
  }

  @ApiOperation({ summary: 'Update an user' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    if (id !== user.id) {
      throw new UnauthorizedException(
        'You are not permitted to change other users profiles.',
      );
    }
    const updatedUser = await this.userService.update(id, data, user);

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  @ApiOperation({ summary: 'Delete an user' })
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    if (id !== user.id) {
      throw new UnauthorizedException(
        'You are not permitted to change other users profiles.',
      );
    }
    const deletedUser = await this.userService.remove(id);

    return {
      message: 'User deleted successfully',
      data: deletedUser,
    };
  }

  @ApiOperation({ summary: 'Upload avatar to profile' })
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
  @Post('avatar')
  async uploadAvatar(
    @CurrentUser() user: User,
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
    avatar: Express.Multer.File,
  ) {
    const path = `${user.id}/avatar-${Date.now()}`;
    const avatarUrl = await this.supabaseService.uploadFile(
      avatar,
      'avatars',
      path,
    );

    await this.userService.update(user.id, { avatarURL: avatarUrl }, user);

    return {
      message: 'Avatar uploaded successfully',
      url: avatarUrl,
    };
  }
}
