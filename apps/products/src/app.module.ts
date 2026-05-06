import { Module } from '@nestjs/common';  
import { ConfigModule } from '@nestjs/config';
import { nxAppEnvFilePaths } from '@jobber/nestjs';
import { LoggerModule } from '@jobber/nestjs';
import { DatabaseModule } from './database/database.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: nxAppEnvFilePaths('products'),
    }),
    DatabaseModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
