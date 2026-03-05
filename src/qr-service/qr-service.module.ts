import { Module } from '@nestjs/common';
import { QrServiceService } from './qr-service.service';

@Module({
  providers: [QrServiceService],
  exports: [QrServiceService],
})
export class QrServiceModule {}
