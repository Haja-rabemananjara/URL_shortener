/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    description: "L'URL originale à raccourcir",
    example: 'https://example.com/some/very/long/path?with=query&params=true',
  })
  @IsUrl({}, { message: 'Veuillez fournir une URL valide (ex: https://example.com)' })
  @IsNotEmpty({ message: 'L\'URL originale est requise' })
  originalUrl: string;

  @ApiProperty({
    description: 'Le code personnalisé pour l\'URL raccourcie (optionnel)',
    example: 'mon lien',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Le code personnalisé doit comporter au moins 3 caractères' })
  @MaxLength(20, { message: 'Le code personnalisé ne peut pas dépasser 20 caractères' })
  customCode?: string;
}