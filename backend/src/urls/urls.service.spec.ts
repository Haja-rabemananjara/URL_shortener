/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock PrismaService
const mockPrismaService = {
  url: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UrlsService', () => {
  let service: UrlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UrlsService>(UrlsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockUrl = {
      id: 'clx123',
      originalUrl: 'https://example.com/long-path',
      shortCode: 'abc123',
      createdAt: new Date('2025-02-17'),
      updatedAt: new Date('2025-02-17'),
    };

    it('devrait créer une nouvelle URL raccourcie', async () => {
      mockPrismaService.url.findFirst.mockResolvedValue(null);
      mockPrismaService.url.create.mockResolvedValue(mockUrl);

      const result = await service.create({
        originalUrl: 'https://example.com/long-path',
      });

      expect(result).toMatchObject({
        id: 'clx123',
        originalUrl: 'https://example.com/long-path',
        shortCode: 'abc123',

      });
      expect(result.shortUrl).toContain('abc123');
      expect(mockPrismaService.url.create).toHaveBeenCalledTimes(1);
    });

    it('devrait retourner une URL existante si l\'URL originale existe déjà', async () => {
      mockPrismaService.url.findFirst.mockResolvedValue(mockUrl);

      const result = await service.create({
        originalUrl: 'https://example.com/long-path',
      });

      expect(mockPrismaService.url.create).not.toHaveBeenCalled();
      expect(result.shortCode).toBe('abc123');
    });

    it('devrait créer une URL avec un code personnalisé', async () => {
      mockPrismaService.url.findFirst.mockResolvedValue(null);
      mockPrismaService.url.findUnique.mockResolvedValue(null);
      mockPrismaService.url.create.mockResolvedValue({
        ...mockUrl,
        shortCode: 'mon-lien',
      });

      const result = await service.create({
        originalUrl: 'https://example.com/long-path',
        customCode: 'mon-lien',
      });

      expect(result.shortCode).toBe('mon-lien');
      expect(mockPrismaService.url.create).toHaveBeenCalledWith({
        data: {
          originalUrl: 'https://example.com/long-path',
          shortCode: 'mon-lien',
        },
      });
    });

    it('devrait lever ConflictException si le code personnalisé est déjà pris', async () => {
      mockPrismaService.url.findFirst.mockResolvedValue(null);
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);

      await expect(
        service.create({
          originalUrl: 'https://example.com/autre-url',
          customCode: 'abc123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('devrait retourner toutes les URLs triées par date décroissante', async () => {
      const urls = [
        {
          id: '1',
          originalUrl: 'https://example.com',
          shortCode: 'abc123',

          createdAt: new Date('2025-02-17'),
          updatedAt: new Date(),
        },
        {
          id: '2',
          originalUrl: 'https://google.com',
          shortCode: 'xyz789',

          createdAt: new Date('2025-02-16'),
          updatedAt: new Date(),
        },
      ];
      mockPrismaService.url.findMany.mockResolvedValue(urls);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].shortCode).toBe('abc123');
    });

    it('devrait retourner un tableau vide si aucune URL', async () => {
      mockPrismaService.url.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findByShortCode', () => {
    it('devrait trouver une URL par son code court', async () => {
      const mockUrl = {
        id: 'clx123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);

      const result = await service.findByShortCode('abc123');
      expect(result.originalUrl).toBe('https://example.com');
    });

    it('devrait lever NotFoundException si le code court est introuvable', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(service.findByShortCode('inexistant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('devrait supprimer une URL existante', async () => {
      const mockUrl = {
        id: 'clx123',
        originalUrl: 'https://example.com',
        shortCode: 'abc123',

        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.url.findUnique.mockResolvedValue(mockUrl);
      mockPrismaService.url.delete.mockResolvedValue(mockUrl);

      await service.delete('clx123');
      expect(mockPrismaService.url.delete).toHaveBeenCalledWith({
        where: { id: 'clx123' },
      });
    });

    it('devrait lever NotFoundException si l\'URL n\'existe pas', async () => {
      mockPrismaService.url.findUnique.mockResolvedValue(null);

      await expect(service.delete('inexistant')).rejects.toThrow(
        NotFoundException,
      );
    });
  });


});
