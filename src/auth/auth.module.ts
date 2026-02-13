import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthService, JwtStrategy, PrismaService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
