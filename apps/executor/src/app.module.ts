import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { ConfigModule } from '@nestjs/config';
import { nxAppEnvFilePaths } from '@jobber/nestjs';
import { LoggerModule } from '@jobber/nestjs';

@Module({
  imports: [
    LoggerModule,
    JobsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: nxAppEnvFilePaths('executor'),
    }),
  ],
})
export class AppModule {}
