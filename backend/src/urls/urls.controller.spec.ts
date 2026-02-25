import { Test, TestingModule } from '@nestjs/testing';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';

const mockUrlsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByShortCode: jest.fn(),
  delete: jest.fn(),
};

describe('UrlsController', () => {
  let controller: UrlsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [{ provide: UrlsService, useValue: mockUrlsService }],
    }).compile();

    controller = module.get<UrlsController>(UrlsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer et retourner une URL raccourcie', async () => {
      const dto = { originalUrl: 'https://example.com' };
      const response = {
        id: '1',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        shortUrl: 'http://localhost:3001/abc123',
        createdAt: new Date(),
      };
      mockUrlsService.create.mockResolvedValue(response);

      const result = await controller.create(dto);
      expect(result).toEqual(response);
      expect(mockUrlsService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('devrait retourner la liste des URLs', async () => {
      const urls = [
        {
          id: '1',
          originalUrl: 'https://example.com',
          shortCode: 'abc',
          shortUrl: 'http://localhost:3001/abc',
          createdAt: new Date(),
        },
      ];
      mockUrlsService.findAll.mockResolvedValue(urls);

      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].shortCode).toBe('abc');
    });
  });
});
