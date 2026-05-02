import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';

export async function bootstrapInit(app: NestFastifyApplication) {
  const globalPrefix = 'api';
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix(globalPrefix);
  app.useLogger(app.get(Logger));
  const port = app.get(ConfigService).getOrThrow<number>('PORT');
  await app.register(fastifyCookie, {
    secret: app.get(ConfigService).getOrThrow<string>('COOKIE_SECRET'),
  });
  await app.listen(port);
  app
    .get<Logger>(Logger)
    .log(`Application is running on: http://localhost:${port}/${globalPrefix}`);
}
