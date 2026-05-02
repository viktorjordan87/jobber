FROM node:25-slim AS builder

WORKDIR /workspace

COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY jest.config.ts ./
COPY jest.preset.js ./
COPY eslint.config.mjs ./

COPY apps/executor ./apps/executor

COPY libs/nestjs ./libs/nestjs
COPY libs/pulsar ./libs/pulsar

RUN npm install

RUN npx nx build executor

FROM node:25-slim AS runner

WORKDIR /app

COPY --from=builder /workspace/package.json ./
COPY --from=builder /workspace/apps/executor/package.json ./apps/executor/package.json
COPY --from=builder /workspace/libs/nestjs/package.json ./libs/nestjs/package.json
COPY --from=builder /workspace/libs/pulsar/package.json ./libs/pulsar/package.json
COPY --from=builder /workspace/package-lock.json ./

ENV NODE_ENV=production

RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /workspace/node_modules/pulsar-client ./node_modules/pulsar-client

COPY --from=builder /workspace/dist/ ./dist/

CMD ["node", "dist/apps/executor/main.js"]
