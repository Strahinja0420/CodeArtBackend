import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('SUPABASE_JWT_SECRET')!;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(jwtSecret, 'base64'),
      algorithms: ['HS256'],
    });

    this.logger.log(
      `JwtStrategy initialized with secret: ${jwtSecret.substring(0, 5)}...`,
    );
  }

  async validate(payload: any) {
    this.logger.log(`Validating JWT payload: ${JSON.stringify(payload)}`);
    return {
      id: payload.sub,
      email: payload.email,
      name:
        payload.user_metadata?.name || payload.email?.split('@')[0] || 'User',
    };
  }
}
