import { Module, RequestMethod } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule, Params } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { Options as PinoHttpOptions } from 'pino-http';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Params => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const pinoHttp = (isProduction
          ? { level: 'info' as const }
          : {
              level: 'debug' as const,
              transport: {
                target: 'pino-pretty',
                options: { singleLine: true },
              },
            }) as unknown as PinoHttpOptions;
        return { pinoHttp };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
