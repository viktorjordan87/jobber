import { Module } from '@nestjs/common';
import { FibonacciJob } from './jobs/fibonacci/fibonacci.job';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME } from '@jobber/grpc';
import { join } from 'node:path';
import { PulsarModule } from '@jobber/pulsar';
import { ConfigService } from '@nestjs/config';
import { LoadProductsJob } from './jobs/products/load-products.job';
import { PrismaModule } from './modules/prisma';
import { JobsController } from './jobs.controller';

@Module({
  imports: [
    PulsarModule,
    DiscoveryModule,
    PrismaModule,
    ClientsModule.registerAsync([
      {
        name: AUTH_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow<string>('AUTH_GRPC_SERVICE_URL'),
            package: AUTH_PACKAGE_NAME,
            protoPath: join(__dirname, 'libs/grpc/src/lib/proto/auth.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [FibonacciJob, JobsService, JobsResolver, LoadProductsJob],
  controllers: [JobsController],
  exports: [],
})
export class JobsModule {}
