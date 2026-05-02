import { Producer } from 'pulsar-client';
import { PulsarClient, serialize } from '@jobber/pulsar';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export abstract class AbstractJob<T extends object> {
  private producer: Producer;
  protected abstract messageClass: new () => T;

  constructor(private readonly pulsarClient: PulsarClient) {}

  async execute(data: T | T[], jobName: string) {
    const payloads = await this.validatedPlainPayloads(data);
    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(jobName);
    }

    for (const message of payloads) {
      await this.send(message);
    }
  }

  private async send(data: T) {
    await this.producer.send({
      data: serialize(data),
    });
  }

  private async validatedPlainPayloads(data: T | T[]): Promise<T[]> {
    const items = Array.isArray(data) ? data : [data];
    const payloads: T[] = [];
    for (const item of items) {
      const instance = plainToInstance(this.messageClass, item);
      const errors = await validate(instance);
      if (errors.length > 0) {
        throw new BadRequestException(
          `Invalid data for job ${this.messageClass.name}: ${JSON.stringify(errors)}`,
        );
      }
      payloads.push(instanceToPlain(instance) as T);
    }
    return payloads;
  }
}
