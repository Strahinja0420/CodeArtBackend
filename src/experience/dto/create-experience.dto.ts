import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExperienceDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'any text rly' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @ApiProperty({ example: 'any text rly' })
  description: string;

  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional()
  audioLocation?: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  storageLocation: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  material?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  period?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  author?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  yearCreated?: number;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  thumbnailURL?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  category?: string;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  avatarURL?: string;
}
