import { Test, TestingModule } from '@nestjs/testing';
import { ShopperService } from './shopper.service';

describe('ShopperService', () => {
  let service: ShopperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopperService],
    }).compile();

    service = module.get<ShopperService>(ShopperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
