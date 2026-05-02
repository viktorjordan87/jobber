import { FastifyRequest } from 'fastify';
import { AuthenticateRequest } from '@jobber/grpc';

export type JwtExtractorRequest = Partial<FastifyRequest> &
  Partial<AuthenticateRequest>;
