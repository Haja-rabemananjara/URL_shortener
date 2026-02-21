/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";

export class UrlResponseDto {
    @ApiProperty({ example : '1' })
    id: number;

    @ApiProperty({ example : 'https://www.example.com/some/long/url' })
    originalUrl: string;

    @ApiProperty({ example : 'abc123' })
    shortCode: string;

    @ApiProperty({ example : 'https://short.ly/abc123' })
    shortUrl: string;

    @ApiProperty({ example : '2024-06-01T12:00:00Z' })
    createdAt: Date;
}