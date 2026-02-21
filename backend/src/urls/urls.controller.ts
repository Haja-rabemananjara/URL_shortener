/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Param } from '@nestjs/common';
import { UrlsService } from './urls.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UrlResponseDto } from './dto/url-response.dto';
import { CreateUrlDto } from './dto/create-url.dto';


@Controller('api/urls')
export class UrlsController {
    constructor(private readonly urlsService: UrlsService) {}

    // Route pour créer une URL raccourcie
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Créer une URL raccourcie' })
    @ApiResponse({ status: 201, description: 'URL raccourcie créée avec succès.', type: UrlResponseDto})
    @ApiResponse({ status: 400, description: 'Requête invalide. Vérifiez les données fournies.' })
    @ApiResponse({ status: 409, description: 'Conflit. Le code personnalisé est déjà utilisé.' })
    async create(@Body() createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
        return this.urlsService.create(createUrlDto);
    }

    // Route pour récupérer toutes les URLs raccourcies
    @Get()
    @ApiOperation({ summary: 'Récupérer toutes les URLs raccourcies' })
    @ApiResponse({ status: 200, description: 'Liste des URLs raccourcies récupérée avec succès.', type: [UrlResponseDto] })
    async findAll(): Promise<UrlResponseDto[]> {
        return this.urlsService.findAll();
    }

    // Route pour supprimer une URL raccourcie
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Supprimer une URL' })
    @ApiParam({ name: 'id', description: "ID de l'URL à supprimer" })
    @ApiResponse({ status: 204, description: 'URL supprimée' })
    @ApiResponse({ status: 404, description: 'URL introuvable' })
    async delete(@Param('id') id: string): Promise<void> {
        return this.urlsService.delete(Number(id));
    }

}
