/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('URL Shortener (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    // Nettoyer la base de test avant les tests
    await prisma.url.deleteMany();
  });

  afterAll(async () => {
    await prisma.url.deleteMany();
    await app.close();
  });

  describe('POST /api/urls', () => {
    it('devrait créer une URL raccourcie', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: 'https://www.github.com/some/long/path' })
        .expect(201);

      expect(response.body).toMatchObject({
        originalUrl: 'https://www.github.com/some/long/path',
        clicks: 0,
      });
      expect(response.body.shortCode).toBeDefined();
      expect(response.body.shortUrl).toContain(response.body.shortCode);
    });

    it('devrait retourner l\'URL existante si l\'URL originale est déjà raccourcie', async () => {
      const url = 'https://unique-existing-url.com';
      const first = await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: url })
        .expect(201);

      const second = await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: url })
        .expect(201);

      expect(first.body.shortCode).toBe(second.body.shortCode);
    });

    it('devrait rejeter une URL invalide', async () => {
      await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: 'pas-une-url' })
        .expect(400);
    });

    it('devrait créer une URL avec un code personnalisé', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: 'https://custom-code-test.com', customCode: 'custom' })
        .expect(201);

      expect(response.body.shortCode).toBe('custom');
    });

    it('devrait rejeter un code personnalisé déjà utilisé', async () => {
      await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: 'https://conflict-test.com', customCode: 'taken' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: 'https://another-url.com', customCode: 'taken' })
        .expect(409);
    });
  });

  describe('GET /api/urls', () => {
    it('devrait retourner la liste de toutes les URLs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/urls')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /:shortCode (redirection)', () => {
    it('devrait rediriger vers l\'URL originale', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: 'https://www.redirect-target.com' })
        .expect(201);

      const { shortCode } = createResponse.body;

      const redirectResponse = await request(app.getHttpServer())
        .get(`/${shortCode}`)
        .expect(302);

      expect(redirectResponse.headers.location).toBe('https://www.redirect-target.com');
    });

    it('devrait retourner 404 pour un code inexistant', async () => {
      await request(app.getHttpServer())
        .get('/code-inexistant-xyz')
        .expect(404);
    });
  });

  describe('DELETE /api/urls/:id', () => {
    it('devrait supprimer une URL', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/urls')
        .send({ originalUrl: 'https://to-delete.com' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/urls/${createResponse.body.id}`)
        .expect(204);
    });
  });
});
