import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Consumer, Message, Producer } from 'pulsar-client';
import { setTimeout as delay } from 'node:timers/promises';

/** Broker can lag behind Docker port publish or JVM warm-up. */
const TRANSIENT_CONNECT = /TimeOut|timeout|ECONNREFUSED|ENOTFOUND|Connection refused|Unable to connect|TopicNotFound|Topic not found/i;

function isTransientBrokerConnectError(err: unknown): boolean {
  return TRANSIENT_CONNECT.test(err instanceof Error ? err.message : String(err));
}

function readConnectMaxAttempts(config: ConfigService): number {
  const v = Number(config.get('PULSAR_CONNECT_MAX_ATTEMPTS'));
  if (!Number.isFinite(v)) return 8;
  const n = Math.floor(v);
  return n >= 1 ? Math.min(30, n) : 8;
}

function readConnectRetryDelayMs(config: ConfigService): number {
  const v = Number(config.get('PULSAR_CONNECT_RETRY_DELAY_MS'));
  return Number.isFinite(v) && v >= 0 ? Math.floor(v) : 2000;
}

@Injectable()
export class PulsarClient implements OnModuleDestroy {
  private readonly client: Client;
  private readonly producers: Producer[] = [];
  private readonly consumers: Consumer[] = [];

  constructor(private readonly configService: ConfigService) {
    const serviceUrl = this.configService.getOrThrow<string>('PULSAR_SERVICE_URL');
    const operationTimeoutSeconds = Number(
      this.configService.get('PULSAR_OPERATION_TIMEOUT_SECONDS') ?? '30',
    );
    this.client = new Client({
      serviceUrl,
      ...(Number.isFinite(operationTimeoutSeconds) && operationTimeoutSeconds > 0
        ? { operationTimeoutSeconds }
        : {}),
    });
  }

  private async withBrokerConnectRetry<T>(fn: () => Promise<T>): Promise<T> {
    const maxAttempts = readConnectMaxAttempts(this.configService);
    const pauseMs = readConnectRetryDelayMs(this.configService);
    let last: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (e) {
        last = e;
        if (attempt === maxAttempts - 1 || !isTransientBrokerConnectError(e)) {
          throw e;
        }
        await delay(pauseMs);
      }
    }
    throw last;
  }

  async createProducer(topic: string) {
    const producer = await this.withBrokerConnectRetry(() =>
      this.client.createProducer({
        blockIfQueueFull: true,
        topic,
      }),
    );
    this.producers.push(producer);
    return producer;
  }

  async createConsumer(
    topic: string,
    listener: (message: Message, consumer: Consumer) => void | Promise<void>,
  ) {
    const consumer = await this.withBrokerConnectRetry(() =>
      this.client.subscribe({
        subscriptionType: 'Shared',
        topic,
        subscription: 'jobber',
        listener,
      }),
    );
    this.consumers.push(consumer);
    return consumer;
  }

  async onModuleDestroy() {
    for (const consumer of this.consumers) {
      await consumer.close();
    }
    for (const producer of this.producers) {
      await producer.close();
    }
    await this.client.close();
  }
}
