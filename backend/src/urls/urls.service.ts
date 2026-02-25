/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CreateUrlDto } from './dto/create-url.dto';
/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Url } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UrlResponseDto } from './dto/url-response.dto';
import { nanoid } from 'nanoid';


// Service pour gérer les URLs
@Injectable()
export class UrlsService {

// Injecter le service Prisma pour accéder à la base de données
  constructor(private readonly prisma: PrismaService) {}

  // ... (autres méthodes pour créer, récupérer, etc.)
  private formatUrl(url: Url): UrlResponseDto{
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${baseUrl}/${url.shortCode}`,
        createdAt: url.createdAt
    };
  }

  // Méthode pour créer une URL raccourcie
    async create(createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
        const { originalUrl, customCode } = createUrlDto;

        // Vérifier si l'URL originale existe déjà
        const existing = await this.prisma.url.findFirst({
            where: { originalUrl },
        });
        if (existing) {
            return this.formatUrl(existing);
        }

        // Générer un code court unique
        const shortCode = customCode || nanoid(6);

        // Vérifier l'unicité du code personnalisé
        if (customCode) {
            const codeExists = await this.prisma.url.findFirst({
                where: { shortCode : customCode },
            });
            if (codeExists) {
                throw new ConflictException(`Le code "${customCode}" est déjà utilisé. Veuillez en choisir un autre.`);
            }
        }
        
        // Créer une nouvelle entrée dans la base de données
        const newUrl = await this.prisma.url.create({
            data: {
                originalUrl,
                shortCode,
            },
        });
        return this.formatUrl(newUrl);
    }

    // Méthode pour récupérer toutes les URLs
    async findAll(): Promise<UrlResponseDto[]> {
        const urls = await this.prisma.url.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return urls.map(url => this.formatUrl(url));
    }

    // Méthode pour trouver une URL par son code court
    async findByShortCode(shortCode: string): Promise<Url> {
        const url = await this.prisma.url.findUnique({
            where: { shortCode },
        });
        if (!url) {
            throw new NotFoundException(`L'URL avec le code court "${shortCode}" n'existe pas.`);
        }
        return url;
    }

    // Méthode pour supprimer une URL par son ID
    async delete(id: number): Promise<void> {
        const url = await this.prisma.url.findUnique({
            where: { id },
        });
        if (!url) {
            throw new NotFoundException(`L'URL avec l'ID "${id}" n'existe pas.`);
        }
        await this.prisma.url.delete({
            where: { id },
        });
    }
}