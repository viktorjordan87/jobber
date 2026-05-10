import { Producer } from 'pulsar-client';
import { PulsarClient, serialize } from '@jobber/pulsar';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { JobStatus } from '../models/job-status.enum';

export abstract class AbstractJob<T extends object> {
  private producer: Producer;
  protected abstract messageClass: new () => T;

  constructor(
    private readonly pulsarClient: PulsarClient,
    private readonly prisma: PrismaService,
  ) {}

  async execute(data: T | T[], jobName: string, jobMetadata = false) {
    if (!this.producer) {
      this.producer = await this.pulsarClient.createProducer(jobName);
    }

    const job = await this.prisma.job.create({
      data: {
        name: jobName,
        size: Array.isArray(data) ? data.length : 1,
        status: JobStatus.IN_PROGRESS,
        completed: 0,
      },
    });

    if (Array.isArray(data)) {
      for (const message of data) {
        this.send({ ...message, jobId: job.id });
      }
      return;
    }

    this.send({ ...data, jobId: job.id });

    if (jobMetadata) {
      return job;
    }
  }

  private send(data: T) {
    this.validatedPlainPayloads(data).then(() => {
      this.producer.send({
        data: serialize(data),
      });
    });
  }

  private async validatedPlainPayloads(data: T | T[]): Promise<T[]> {
    const items = Array.isArray(data) ? data : [data];
    const validated: T[] = [];
    for (const item of items) {
      const instance = plainToInstance(this.messageClass, item);
      const errors = await validate(instance);
      if (errors.length > 0) {
        throw new BadRequestException(
          `Invalid data for job ${this.messageClass.name}: ${JSON.stringify(errors)}`,
        );
      }
      validated.push(instanceToPlain(instance) as T);
    }
    return validated;
  }
}
