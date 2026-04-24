import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from "./modules/prisma";
import { PrismaService } from './modules/prisma/prisma.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    playground: true,
    autoSchemaFile: true,
  }), UsersModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule { }
