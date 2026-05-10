import {
  AcknowledgeRequest,
  JOB_SERVICE_NAME,
  JobServiceClient,
} from '@jobber/grpc';
import { PulsarClient, PulsarConsumer } from '@jobber/pulsar';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

export abstract class JobsConsumer<
  T extends AcknowledgeRequest,
> extends PulsarConsumer<T> {
  private jobsService: JobServiceClient;

  constructor(
    topic: string,
    pulsarClient: PulsarClient,
    private readonly grpcClient: ClientGrpc,
  ) {
    super(pulsarClient, topic);
  }

  async onModuleInit() {
    await super.onModuleInit();
    this.jobsService =
      this.grpcClient.getService<JobServiceClient>(JOB_SERVICE_NAME);
  }

  protected async onMessage(data: T): Promise<void> {
    await this.execute(data);
    await firstValueFrom(this.jobsService.acknowledge(data));
  }

  protected abstract execute(data: T): Promise<void>;
}
