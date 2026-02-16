import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserWithRelations } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<UserWithRelations[]> {
    const users = await this.userService.findAll();

    if (!users) {
      throw new NotFoundException('There are no users in the database');
    }

    return users;
  }

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
