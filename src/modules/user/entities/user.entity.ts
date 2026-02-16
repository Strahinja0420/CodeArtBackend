import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class User {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  avatarURL?: string | null;

  @ApiPropertyOptional()
  institutionName?: string | null;

  @ApiPropertyOptional()
  dark?: boolean | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Exclude()
  passwordHash?: string | null;
}

const userWithRelations = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { experiences: true, qrStyle: true },
});

export type UserWithRelations = Prisma.UserGetPayload<typeof userWithRelations>;
