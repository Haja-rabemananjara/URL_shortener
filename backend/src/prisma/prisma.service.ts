/* eslint-disable prettier/prettier */
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Load environment variables from .env file
import * as dotenvg from 'dotenv';
dotenvg.config();

// Service pour gérer la connexion à la base de données avec Prisma
@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {

    constructor () {
        // Create a new PostgreSQL connection pool using the connection string from environment variables
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL
        });

        const adapter = new PrismaPg(pool);

        super({adapter});
    }

    // Method called when the module is initialized to connect to the database
    async onModuleInit() {
        try {
            await this.$connect();
            console.log('Connected to the database');
        }
        catch (error) {
            console.error('Failed to connect to the database:', error);
            process.exit(1); // Exit the application if the database connection fails
        }
    }

    // Method called when the module is destroyed to disconnect from the database
    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Disconnected from the database');
    }
}
