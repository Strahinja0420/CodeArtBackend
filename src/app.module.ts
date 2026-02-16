import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UserModule } from './modules/user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ExperienceModule } from './experience/experience.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    SupabaseModule,
    UserModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ExperienceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
