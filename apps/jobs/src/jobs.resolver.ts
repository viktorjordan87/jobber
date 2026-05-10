import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Job } from './models/job.model';
import { JobsService } from './jobs.service';
import { ExecuteJobDto } from './dto/execute-job.dto';
import { GrpcGqlAuthGuard } from '@jobber/graphql';
import { UseGuards } from '@nestjs/common';
import { JobMetadata } from './models/job-metadata.model';

@Resolver()
export class JobsResolver {
  constructor(private readonly jobService: JobsService) {}

  @Query(() => [Job], { name: 'jobs' })
  @UseGuards(GrpcGqlAuthGuard)
  async getJobs() {
    return this.jobService.getJobs();
  }

  @Query(() => [Job], { name: 'job' })
  @UseGuards(GrpcGqlAuthGuard)
  async getJob(@Args('id') id: number) {
    return this.jobService.getJob(id);
  }

  @Query(() => [JobMetadata], { name: 'jobsMetadata' })
  @UseGuards(GrpcGqlAuthGuard)
  async getJobMetadata() {
    return this.jobService.getJobMetadata();
  }

  @Mutation(() => JobMetadata)
  @UseGuards(GrpcGqlAuthGuard)
  async executeJob(@Args('executeJobData') executeJobData: ExecuteJobDto) {
    return this.jobService.executeJobMetadata(
      executeJobData.jobName,
      executeJobData.data,
    );
  }
}
