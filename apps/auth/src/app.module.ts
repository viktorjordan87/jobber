import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { nxAppEnvFilePaths } from '@jobber/nestjs';
import { PrismaModule } from './modules/prisma';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: nxAppEnvFilePaths('auth'),
    }),
    PrismaModule,
    GraphQLModule.forRoot<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      graphiql: true,
      autoSchemaFile: true,
      context: (request, reply) => ({ req: request, res: reply }),
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
