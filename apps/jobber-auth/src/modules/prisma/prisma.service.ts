import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../prisma/generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        const connectionString = process.env.DATABASE_URL as string;


        if(!connectionString) {
            throw new Error('DATABASE_URL is not set');
        }

        const adapter = new PrismaPg({ connectionString });

        super({
            adapter
        });
    }

    async onModuleInit() {
        await this.$connect()
    }
}
