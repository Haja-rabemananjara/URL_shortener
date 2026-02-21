import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

/**
 * The main application module. This is where you can import other modules, declare controllers, and provide services.
 * In a real application, you would typically have multiple modules for different features (e.g., UserModule, AuthModule, etc.).
 */
@Module({
  imports: [PrismaModule], // Importing the PrismaModule to make the PrismaService available in this module.
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
