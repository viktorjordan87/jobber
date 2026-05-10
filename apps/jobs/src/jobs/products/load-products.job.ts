import { Jobs } from '@jobber/nestjs';
import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract-job';
import { LoadProductMessage, PulsarClient } from '@jobber/pulsar';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Job({
  name: Jobs.LOAD_PRODUCTS,
  description: 'Load products into the database after enrichment.',
})
export class LoadProductsJob extends AbstractJob<LoadProductMessage> {
  protected messageClass = LoadProductMessage;
  constructor(pulsarClient: PulsarClient, prisma: PrismaService) {
    super(pulsarClient, prisma);
  }
}
