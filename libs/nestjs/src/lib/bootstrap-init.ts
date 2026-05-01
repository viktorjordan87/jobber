import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import fastifyCookie from '@fastify/cookie';

export async function bootstrapInit(app: NestFastifyApplication) {
  const globalPrefix = 'api';
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix(globalPrefix);
  const port = app.get(ConfigService).getOrThrow<number>('PORT');
  await app.register(fastifyCookie, {
    secret: app.get(ConfigService).getOrThrow<string>('COOKIE_SECRET'),
  });
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
