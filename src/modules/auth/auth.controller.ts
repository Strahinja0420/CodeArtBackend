import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { CurrentUser } from 'src/decorators/user.decorator';
import { Public } from 'src/decorators/public.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '@prisma/client';
import { AuthResponse } from './entities/auth-response.entity';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Used to test JWT guard' })
  @Get('public')
  publicRoute() {
    return { message: 'Hello! I am public.' };
  }

  @ApiOperation({ summary: 'Used to test JWT guard' })
  @Get('private')
  privateRoute(@CurrentUser() user: User) {
    return {
      message: 'Success! You are authenticated with Supabase.',
      user,
    };
  }

  @Public()
  @ApiOperation({ summary: 'Log in as an user' })
  @ApiOkResponse({ type: AuthResponse })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('login')
  async login(@Body() signInDto: SignInDto): Promise<AuthResponse> {
    return await this.authService.signIn(signInDto);
  }

  @Public()
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiOkResponse({ type: AuthResponse })
  @Post('register')
  async signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponse> {
    return await this.authService.signUp(signUpDto);
  }
}
