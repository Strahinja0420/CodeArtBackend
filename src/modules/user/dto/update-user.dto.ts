import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

class UpdateQrStyleDto {
  @ApiPropertyOptional({
    description:
      'Dynamic configuration for the QR code appearance (colors, shapes, etc.)',
    example: { eyeColor: '#ff0000', bodyType: 'dots' },
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
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
