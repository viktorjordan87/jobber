import { FastifyRequest } from 'fastify';
import { AuthenticateRequest } from '@jobber/proto';

export type JwtExtractorRequest = Partial<FastifyRequest> &
  Partial<AuthenticateRequest>;
