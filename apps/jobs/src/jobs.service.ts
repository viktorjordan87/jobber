import {
  DiscoveredClassWithMeta,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
import { JOB_METADATA_KEY } from './decorators/job.decorator';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { JobMetadata } from './types/job-metadata.type';
import { AbstractJob } from './jobs/abstract-job';
import { readFileSync } from 'node:fs';
import { UPLOAD_FILE_PATH } from './uploads/upload.const';
import { PrismaService } from './modules/prisma/prisma.service';
import { JobStatus } from './models/job-status.enum';

@Injectable()
export class JobsService implements OnModuleInit {
  private jobs: DiscoveredClassWithMeta<JobMetadata>[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.jobs =
      await this.discoveryService.providersWithMetaAtKey<JobMetadata>(
        JOB_METADATA_KEY,
      );
  }

  getJobs() {
    return this.jobs.map((job) => job.meta);
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  async executeJob(jobName: string, data: object | any) {
    const job = this.jobs.find((job) => job.meta.name === jobName);
    if (!job) {
      throw new NotFoundException(`Job name: ${jobName} not found`);
    }
    if (!(job.discoveredClass.instance instanceof AbstractJob)) {
      throw new InternalServerErrorException(
        'Job is not an instance of AbstractJob',
      );
    }
    await job.discoveredClass.instance.execute(
      data.fileName ? this.getFile(data.fileName) : data,
      job.meta.name,
    );
    return job.meta;
  }

  private getFile(fileName?: string) {
    if (!fileName) {
      return;
    }

    try {
      return JSON.parse(
        readFileSync(`${UPLOAD_FILE_PATH}/${fileName}`, 'utf-8'),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error reading file ${fileName}: ${error.message}`,
      );
    }
  }

  async acknowledge(jobId: number) {
    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with id ${jobId} not found`);
    }

    if (job.ended) {
      return;
    }

    const updatedJob = await this.prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        completed: {
          increment: 1,
        },
      },
    });

    if (updatedJob.completed === updatedJob.size) {
      await this.prisma.job.update({
        where: {
          id: jobId,
        },
        data: {
          status: JobStatus.COMPLETED,
          ended: new Date(),
        },
      });
    }

    return updatedJob;
  }
}
