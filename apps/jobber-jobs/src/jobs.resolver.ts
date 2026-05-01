import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Job } from './models/job.model';
import { JobsService } from './jobs.service';
import { ExecuteJobDto } from './dto/execute-job.dto';
import { GrpcGqlAuthGuard } from '@jobber/nestjs';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class JobsResolver {
  constructor(private readonly jobService: JobsService) {}

  @Query(() => [Job], { name: 'jobs' })
  @UseGuards(GrpcGqlAuthGuard)
  async getJobs() {
    return this.jobService.getJobs();
  }

  @Mutation(() => Job)
  @UseGuards(GrpcGqlAuthGuard)
  async executeJob(@Args('executeJobData') executeJobData: ExecuteJobDto) {
    return this.jobService.executeJob(
      executeJobData.jobName,
      executeJobData.data,
    );
  }
}
