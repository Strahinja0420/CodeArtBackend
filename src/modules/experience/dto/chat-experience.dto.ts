import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ChatMessageDto {
  @ApiProperty({ description: 'Role of the message (user, system, or assistant)' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ description: 'Content of the message' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatExperienceDto {
  @ApiProperty({ type: [ChatMessageDto], description: 'List of messages' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
