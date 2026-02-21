import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// This module provides the PrismaService, which is responsible for connecting to the database and providing an interface to interact with it.
@Global() // This makes the PrismaService available globally, so we don't have to import PrismaModule in every module that needs it.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // This allows other modules to import PrismaService when they import PrismaModule.
})
export class PrismaModule {}
