import { Producer } from 'pulsar-client';
import { PulsarClient, serialize } from '@jobber/pulsar';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export abstract class AbstractJob<T extends object> {
  private producer: Producer;
  protected abstract messageClass: new () => T;

  constructor(private readonly pulsarClient: PulsarClient) {}

  async execute(data: T, jobName: string) {
    await this.validateData(data);
    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(jobName);
    }

    await this.producer.send({
      data: serialize(data),
    });
  }

  private async validateData(data: T): Promise<void> {
    const message = plainToInstance(this.messageClass, data);
    const errors = await validate(message);
    if (errors.length > 0) {
      throw new BadRequestException(
        `Invalid data for job ${this.messageClass.name}: ${JSON.stringify(errors)}`,
      );
    }
  }
}
