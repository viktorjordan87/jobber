import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { nxAppEnvFilePaths } from '@jobber/nestjs';
import { JobsModule } from './jobs.modules';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { mercuriusGqlLoggerForRoot } from '@jobber/graphql';
import { LoggerModule } from '@jobber/nestjs';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    LoggerModule,
    UploadsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: nxAppEnvFilePaths('jobs'),
    }),
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: true,
      context: (request, reply) => ({ req: request, res: reply }),
      ...mercuriusGqlLoggerForRoot(),
    }),
    JobsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
