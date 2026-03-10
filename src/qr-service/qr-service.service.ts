import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
// @ts-ignore
import sharp from 'sharp';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class QrServiceService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  async generateQRCode(experienceId: string, options: any) {
    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const targetUrl = `${baseUrl}/experience/${experienceId}`;

    try {
      // 1. Generate Base QR Code
      const qrBuffer = await QRCode.toBuffer(targetUrl, {
        errorCorrectionLevel: 'H',
        margin: 4,
        width: 1000,
        color: {
          dark: options.fgColor || '#000000',
          light: options.bgColor || '#ffffff',
        },
      });

      let finalBuffer = qrBuffer;

      // 2. Composite Logo if exists
      if (options.logoURL) {
        try {
          const logoResponse = await fetch(options.logoURL);
          const logoArrayBuffer = await logoResponse.arrayBuffer();
          const logoInputBuffer = Buffer.from(logoArrayBuffer);

          const logoSize = options.logoSize || 200; // Expected size in px for a 1000px QR
          const logoPadding = 20;
          const bgSize = logoSize + logoPadding * 2;

          // Prepare the logo (resize + rounded corners)
          const logoRadius =
            options.logoPaddingStyle === 'circle' ? bgSize / 2 : 16;

          const processedLogo = await sharp(logoInputBuffer)
            .resize(logoSize, logoSize, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .toBuffer();

          // Create a white background disk/square for the logo
          const logoBg = await sharp({
            create: {
              width: bgSize,
              height: bgSize,
              channels: 4,
              background: options.bgColor || '#ffffff',
            },
          })
            .composite([
              {
                input: Buffer.from(
                  `<svg><rect x="0" y="0" width="${bgSize}" height="${bgSize}" rx="${logoRadius}" ry="${logoRadius}" /></svg>`,
                ),
                blend: 'dest-in',
              },
            ])
            .composite([{ input: processedLogo, gravity: 'center' }])
            .png()
            .toBuffer();

          // Composite everything onto the QR code
          finalBuffer = await sharp(qrBuffer)
            .composite([{ input: logoBg, gravity: 'center' }])
            .png()
            .toBuffer();
        } catch (logoErr) {
          console.warn(
            'Failed to process logo, proceeding with plain QR:',
            logoErr,
          );
          // If logo fails, we still have the qrBuffer
        }
      }

      const qrCodeUrl = await this.supabaseService.uploadFile(
        {
          buffer: finalBuffer,
          mimetype: 'image/png',
          originalname: 'qr-code.png',
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
