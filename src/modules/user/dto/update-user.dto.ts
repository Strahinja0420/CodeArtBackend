import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

class UpdateQrStyleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUrl()
  logoURL?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'newName',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dark?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarURL?: string;

  @ApiPropertyOptional({ type: () => UpdateQrStyleDto })
  @IsOptional()
  @IsObject()
  qrStyle?: UpdateQrStyleDto;
}
