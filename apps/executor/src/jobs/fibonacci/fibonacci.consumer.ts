import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PulsarClient } from '@jobber/pulsar';
import { FibonacciMessage } from '@jobber/pulsar';
import { iterate } from 'fibonacci';
import { Jobs } from '@jobber/nestjs';
import { JobsConsumer } from '../jobs.consumer';
import { JOBS_PACKAGE_NAME } from '@jobber/grpc';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class FibonacciConsumer
  extends JobsConsumer<FibonacciMessage>
  implements OnModuleInit
{
  constructor(
    pulsarClient: PulsarClient,
    @Inject(JOBS_PACKAGE_NAME) private clientJobs: ClientGrpc,
  ) {
    super(Jobs.FIBONACCI, pulsarClient, clientJobs);
  }

  /** Ensures Nest runs subscription setup (parent `onModuleInit` is not always picked up). */
  async onModuleInit() {
    await super.onModuleInit();
  }

  protected async execute(data: FibonacciMessage): Promise<void> {
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
