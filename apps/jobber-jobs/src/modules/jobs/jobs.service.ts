import {
  DiscoveredClassWithMeta,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
import { JOB_METADATA_KEY } from '../../decorators/job.decorator';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { JobMetadata } from '../../types/job-metadata.type';
import { AbstractJob } from './abstract-job';

@Injectable()
export class JobsService implements OnModuleInit {
  private jobs: DiscoveredClassWithMeta<JobMetadata>[] = [];

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.jobs =
      await this.discoveryService.providersWithMetaAtKey<JobMetadata>(
        JOB_METADATA_KEY,
      );
  }

  getJobs() {
    return this.jobs.map((job) => job.meta);
  }

  async executeJob(jobName: string) {
    const job = this.jobs.find((job) => job.meta.name === jobName);
    if (!job) {
      throw new NotFoundException(`Job name: ${jobName} not found`);
    }
    await (job.discoveredClass.instance as AbstractJob).execute();
    return job.meta;
  }
}
