import {
  AcknowledgeRequest,
  JobServiceController,
  JobServiceControllerMethods,
} from '@jobber/grpc';
import { Controller } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
@JobServiceControllerMethods()
export class JobsController implements JobServiceController {
  constructor(private readonly jobsService: JobsService) {}

  async acknowledge(request: AcknowledgeRequest) {
    await this.jobsService.acknowledge(request.jobId);
  }
}
