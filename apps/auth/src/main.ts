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
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';
import { AUTH_PACKAGE_NAME } from '@jobber/grpc';
import { bootstrapInit } from '@jobber/nestjs';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );
  await bootstrapInit(app);
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: app.get(ConfigService).getOrThrow<string>('AUTH_GRPC_SERVICE_URL'),
      package: AUTH_PACKAGE_NAME, // name of the package in the proto file
      protoPath: join(__dirname, 'libs/grpc/src/lib/proto/auth.proto'),
    },
  });
  await app.startAllMicroservices();
}

bootstrap();
