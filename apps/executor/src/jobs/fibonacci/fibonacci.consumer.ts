import { Injectable, OnModuleInit } from '@nestjs/common';
import { PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { FibonacciMessage } from '@jobber/pulsar';
import { iterate } from 'fibonacci';
import { Jobs } from '@jobber/nestjs';

@Injectable()
export class FibonacciConsumer
  extends PulsarConsumer<FibonacciMessage>
  implements OnModuleInit
{
  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient, Jobs.FIBONACCI);
  }

  /** Ensures Nest runs subscription setup (parent `onModuleInit` is not always picked up). */
  async onModuleInit() {
    await super.onModuleInit();
  }

  protected async onMessage(data: FibonacciMessage): Promise<void> {
    const iterations = Number(data.iterations);
    if (!Number.isFinite(iterations) || iterations < 1) {
      this.logger.warn(
        `Skipping message: need iterations >= 1, got ${JSON.stringify(data)}`,
      );
      return;
    }

    const started = Date.now();
    const result = iterate(iterations);
    this.logger.log(
      `Fibonacci done: iterations=${iterations}, digits=${result.length}, computeMs=${result.ms}, totalMs=${Date.now() - started}`,
    );
  }
}
