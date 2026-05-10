import { LoadProductsConsumer } from './load-products.consumer';
import { Module } from '@nestjs/common';
import { PulsarModule } from '@jobber/pulsar';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PRODUCTS_PACKAGE_NAME } from '@jobber/grpc';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { JobClientsModule } from '../job-clients.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PRODUCTS_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow<string>('PRODUCTS_GRPC_SERVICE_URL'),
            package: PRODUCTS_PACKAGE_NAME,
            protoPath: join(
              __dirname,
              'libs/grpc/src/lib/proto/products.proto',
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    PulsarModule,
    JobClientsModule,
  ],
  providers: [LoadProductsConsumer],
  exports: [],
})
export class LoadProductsModule {}
