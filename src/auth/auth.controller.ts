import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/auth.guard';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { User } from 'src/user/entities/user.entity';
import { CurrentUser } from 'src/guards/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('public')
  publicRoute() {
    return { message: 'Hello! I am public.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('private')
  privateRoute(@CurrentUser() user: User) {
    return {
      message: 'Success! You are authenticated with Supabase.',
      user,
    };
  }

  @Post('login')
  async login(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('register')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }
}
