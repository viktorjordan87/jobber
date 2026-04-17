import { Test, TestingModule } from '@nestjs/testing';
import { PrimsaService } from './primsa.service';

describe('PrimsaService', () => {
  let service: PrimsaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrimsaService],
    }).compile();

    service = module.get<PrimsaService>(PrimsaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
