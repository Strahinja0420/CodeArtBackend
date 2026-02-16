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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserWithRelations } from './entities/user.entity';
import { CurrentUser } from 'src/decorators/user.decorator';
import { JwtAuthGuard } from 'src/guards/auth.guard';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  @ApiOkResponse({ type: User })
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
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, data);

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  @ApiOperation({ summary: 'Delete an user' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedUser = await this.userService.remove(id);

    return {
      message: 'User deleted successfully',
      data: deletedUser,
    };
  }
}
