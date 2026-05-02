FROM node:25-slim AS builder

WORKDIR /workspace

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./
COPY scripts ./scripts

COPY apps/jobs ./apps/jobs

COPY libs/graphql ./libs/graphql
COPY libs/grpc ./libs/grpc
COPY libs/nestjs ./libs/nestjs
COPY libs/pulsar ./libs/pulsar

RUN npm install

RUN apt-get update && apt-get install -y protobuf-compiler

RUN npx nx build jobs

FROM node:25-slim AS runner

WORKDIR /app

COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/apps/jobs/package.json ./apps/jobs/package.json
COPY --from=builder /workspace/libs/graphql/package.json ./libs/graphql/package.json
COPY --from=builder /workspace/libs/grpc/package.json ./libs/grpc/package.json
COPY --from=builder /workspace/libs/nestjs/package.json ./libs/nestjs/package.json
COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/package.json
COPY --from=builder /workspace/package-lock.json ./

ENV NODE_ENV=production

RUN npm ci --omit=dev --ignore-scripts

# pulsar-client needs postinstall (native binding); --ignore-scripts skips it — reuse builder install
COPY --from=builder /workspace/node_modules/pulsar-client ./node_modules/pulsar-client

COPY --from=builder /workspace/dist/ ./dist/

CMD ["node", "dist/apps/jobs/main.js"]