import { Test, TestingModule } from '@nestjs/testing';
import { QrServiceService } from './qr-service.service';

describe('QrServiceService', () => {
  let service: QrServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QrServiceService],
    }).compile();

    service = module.get<QrServiceService>(QrServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
