import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { PrismaService } from 'prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async signUp(signupDto: SignUpDto) {
    const { name, email, password } = signupDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { name },
    });
    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    const { data, error } = await this.supabaseService.client.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error || !data.user) {
      throw new UnauthorizedException(error?.message || 'Registration failed');
    }

    const prismaUser = await this.prisma.user.create({
      data: {
        id: data.user.id,
        name: name,
        email: data.user.email!,
      },
    });

    return {
      user: prismaUser,
      access_token: data.session?.access_token,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const { data, error } =
      await this.supabaseService.client.auth.signInWithPassword({
        email,
        password,
      });
    if (error || !data.user) {
      throw new UnauthorizedException(error?.message || 'User not found');
    }
    const userEmail = data.user.email || email;
    const userName = data.user.user_metadata?.name || userEmail.split('@')[0];

    const prismaUser = await this.prisma.user.upsert({
      where: { id: data.user.id },
      update: { email: userEmail },
      create: {
        id: data.user.id,
        email: userEmail,
        name: userName,
      },
    });
    return {
      user: prismaUser,
      access_token: data.session.access_token,
    };
  }
}
