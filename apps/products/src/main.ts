/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
require('module-alias/register');
import { NestFactory } from '@nestjs/core';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { bootstrapInit } from '@jobber/nestjs';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { PRODUCTS_PACKAGE_NAME } from '@jobber/grpc';

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
      url: app.get(ConfigService).getOrThrow<string>('PRODUCTS_GRPC_SERVICE_URL'),
      package: PRODUCTS_PACKAGE_NAME, // name of the package in the proto file
      protoPath: join(__dirname, 'libs/grpc/src/lib/proto/products.proto'),
    },
  });
  await app.startAllMicroservices();
 
}

bootstrap();
