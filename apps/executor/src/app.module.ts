import { Module } from '@nestjs/common';
import { JobsModule } from './jobs/jobs.module';
import { ConfigModule } from '@nestjs/config';
import { nxAppEnvFilePaths } from '@jobber/nestjs';

@Module({
  imports: [
    JobsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: nxAppEnvFilePaths('executor'),
    }),
  ],
})
export class AppModule {}
