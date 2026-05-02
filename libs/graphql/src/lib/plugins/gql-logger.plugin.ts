import { Logger } from '@nestjs/common';
import type { FastifyInstance } from 'fastify';
import type { DocumentNode, GraphQLSchema } from 'graphql';
import { getOperationAST, Kind, print } from 'graphql';
import { GqlContext } from '../graphql/gql-context.interface';

const startKey = Symbol('gqlStart');
const queryKey = Symbol('gqlQuery');
const skipKey = Symbol('gqlSkip');

/** Same logging pipeline as `GrpcGqlAuthGuard` / `app.useLogger` (nestjs-pino). */
const nestLogger = new Logger('GraphQL');

type ContextBag = Record<string | symbol, unknown>;
type MercuriusGraphql = {
  addHook: (name: string, fn: (...args: unknown[]) => unknown) => void;
};

function isIntrospectionQuery(source: string) {
  const trimmed = source.trim();
  return /\b__schema\b/.test(trimmed) || /\b__type\s*\(/.test(trimmed);
}

function operationKind(document: DocumentNode): string {
  const ast = getOperationAST(document, undefined);
  if (ast?.kind === Kind.OPERATION_DEFINITION) {
    return ast.operation;
  }
  return 'unknown';
}

function resolveQueryText(bag: ContextBag, document: DocumentNode): string {
  const fromBag = bag[queryKey];
  if (typeof fromBag === 'string' && fromBag.length > 0) {
    return fromBag;
  }
  return print(document);
}

/**
 * Pass into {@link MercuriusDriverConfig} as `hooks` so Nest registers them with Mercurius at startup.
 * Uses Nest `Logger` so lines show next to other app logs (Fastify `req.log` is often unset with nestjs-pino).
 */
export const mercuriusGqlLoggerHooks = {
  async preParsing(_schema: GraphQLSchema, source: string, context: object) {
    const bag = context as ContextBag;
    if (isIntrospectionQuery(source)) {
      bag[skipKey] = true;
      return;
    }
    bag[startKey] = Date.now();
    bag[queryKey] = source;
  },

  async preExecution(
    _schema: GraphQLSchema,
    document: DocumentNode,
    context: object,
    variables?: Record<string, unknown>,
  ) {
    const bag = context as ContextBag;
    if (bag[skipKey]) return;
    if (typeof bag[startKey] !== 'number') {
      bag[startKey] = Date.now();
    }
    const queryText = resolveQueryText(bag, document);
    bag[queryKey] = queryText;

    nestLogger.log({
      event: 'graphql_request',
      operation: operationKind(document),
      query: queryText,
      variables: variables ?? {},
    });
  },

  async onResolution(
    execution: { errors?: ReadonlyArray<{ message: string }> },
    context: object,
  ) {
    const bag = context as ContextBag;
    if (bag[skipKey]) return;
    const query = bag[queryKey];
    if (typeof query !== 'string') return;
    const startedAt = bag[startKey];
    const ctx = context as Partial<GqlContext> & {
      reply?: { statusCode?: number };
    };
    const durationMs =
      typeof startedAt === 'number' ? Date.now() - startedAt : undefined;
    nestLogger.log({
      event: 'graphql_response',
      query,
      statusCode: ctx.res?.statusCode ?? ctx.reply?.statusCode ?? 200,
      ...(durationMs !== undefined ? { duration: `${durationMs}ms` } : {}),
      ...(execution.errors?.length
        ? { errors: execution.errors.map((error) => error.message) }
        : {}),
    });
  },
};

/** Spread into `GraphQLModule.forRoot({ ... })` next to `driver`, `context`, etc. */
export function mercuriusGqlLoggerForRoot(): {
  hooks: typeof mercuriusGqlLoggerHooks;
} {
  return { hooks: mercuriusGqlLoggerHooks };
}

/** Optional: plain Fastify app after `mercurius` is registered (no Nest). */
export async function registerMercuriusGraphqlLogging(
  fastify: FastifyInstance,
) {
  await fastify.ready();
  const graphql = (fastify as { graphql?: MercuriusGraphql }).graphql;
  if (!graphql?.addHook) {
    fastify.log.warn(
      'Mercurius GraphQL logging: fastify.graphql not available',
    );
    return;
  }
  graphql.addHook('preParsing', mercuriusGqlLoggerHooks.preParsing);
  graphql.addHook('preExecution', mercuriusGqlLoggerHooks.preExecution);
  graphql.addHook('onResolution', mercuriusGqlLoggerHooks.onResolution);
}
