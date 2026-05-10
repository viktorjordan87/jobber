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
import fastifyMultipart from '@fastify/multipart';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { JOBS_PACKAGE_NAME } from '@jobber/grpc';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 1024 * 1024 * 20, // 20MB
    },
  });
  await bootstrapInit(app, 'jobs');
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow<string>('JOBS_GRPC_SERVICE_URL'),
      package: JOBS_PACKAGE_NAME, // name of the package in the proto file
      protoPath: join(__dirname, 'libs/grpc/src/lib/proto/job.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
