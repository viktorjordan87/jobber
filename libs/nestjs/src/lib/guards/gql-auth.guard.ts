import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { catchError, map, Observable, of } from 'rxjs';
import {
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME,
  AuthServiceClient,
  User,
} from '@jobber/proto';
import { ClientGrpc } from '@nestjs/microservices';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FastifyRequest } from 'fastify';
import '@fastify/cookie';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

@Injectable()
export class GrpcGqlAuthGuard implements CanActivate, OnModuleInit {
  private logger = new Logger(GrpcGqlAuthGuard.name);
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_PACKAGE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.authService =
      this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    this.logger.log('Guard invoked');
    const token = this.getRequest(context).cookies['access_token'];
    if (!token) {
      this.logger.warn('No access_token cookie found');
      return false;
    }

    this.logger.log('Calling auth gRPC authenticate');
    return this.authService.authenticate({ token }).pipe(
      map((response) => {
        this.logger.log(response);
        this.getRequest(context).user = response;
        return true;
      }),
      catchError((error) => {
        this.logger.error(error);
        return of(false);
      }),
    );
  }

  private getRequest(context: ExecutionContext): FastifyRequest {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
