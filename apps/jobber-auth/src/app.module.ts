import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from "./modules/prisma";
import { PrismaService } from './modules/prisma/prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
