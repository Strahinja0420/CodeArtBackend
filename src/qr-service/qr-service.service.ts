import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class QrServiceService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async generateQRCode(experienceId: string, options: any) {
    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const targetUrl = `${baseUrl}/experience/${experienceId}`;

    try {
      const buffer = await QRCode.toBuffer(targetUrl, options);

      const qrCodeUrl = await this.supabaseService.uploadFile(
        {
          buffer: buffer,
          mimetype: 'image/png',
        } as any,
        'qrcodes',
        `${experienceId}/qr-code.png`,
      );

      return qrCodeUrl;
    } catch (err) {
      console.error('QR Generation Error:', err);
      throw new InternalServerErrorException('Failed to create QR code.');
    }
  }
}
