import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Experience {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ example: 'The Golden Statue' })
  title: string;

  @ApiProperty({ example: 'An ancient artifact discovered in...' })
  description: string;

  @ApiProperty({ example: 0 })
  scanCount: number;

  @ApiPropertyOptional({ example: 'https://storage.com/audio.mp3' })
  audioLocation?: string | null;

  @ApiPropertyOptional({ example: 'https://storage.com/model.glb' })
  storageLocation?: string | null;

  @ApiPropertyOptional({ example: 'Gold' })
  material?: string | null;

  @ApiPropertyOptional({ example: 'Roman Empire' })
  period?: string | null;

  @ApiPropertyOptional({ example: 'Unknown Artist' })
  author?: string | null;

  @ApiPropertyOptional({ example: 120 })
  yearCreated?: number | null;

  @ApiPropertyOptional({ example: 'https://storage.com/thumb.jpg' })
  thumbnailURL?: string | null;

  @ApiPropertyOptional({ example: 'Statues' })
  category?: string | null;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
