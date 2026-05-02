/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
require('module-alias/register');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { bootstrapInit } from '@jobber/nestjs';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );
  await bootstrapInit(app);
}

bootstrap();
