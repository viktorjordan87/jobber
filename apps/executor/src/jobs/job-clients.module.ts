import { JOBS_PACKAGE_NAME } from '@jobber/grpc';
import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: JOBS_PACKAGE_NAME,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.getOrThrow<string>('JOBS_GRPC_SERVICE_URL'),
            package: JOBS_PACKAGE_NAME,
            protoPath: join(__dirname, 'libs/grpc/src/lib/proto/job.proto'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class JobClientsModule {}
