import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { nxAppEnvFilePaths } from '@jobber/nestjs';
import { DATABASE_CONNECTION } from './database-connection';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as productsSchema from '../products/schema';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: nxAppEnvFilePaths('products'),
        }),
    ],
    providers: [{
        provide: DATABASE_CONNECTION,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
            const pool = new Pool({
                connectionString: configService.getOrThrow<string>('DATABASE_URL'),
            });
            return drizzle(pool, {
                schema: {
                    ...productsSchema,
                }
            });
        },
    }],
    exports: [DATABASE_CONNECTION],
})  
export class DatabaseModule {}