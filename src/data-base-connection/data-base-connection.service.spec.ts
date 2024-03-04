import { Test, TestingModule } from '@nestjs/testing';
import { DataBaseConnectionService } from './data-base-connection.service';

describe('DataBaseConnectionService', () => {
  let service: DataBaseConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataBaseConnectionService],
    }).compile();

    service = module.get<DataBaseConnectionService>(DataBaseConnectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
