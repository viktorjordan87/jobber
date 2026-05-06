import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract-job';
import { PulsarClient } from '@jobber/pulsar';
import { FibonacciMessage } from '@jobber/pulsar';
import { Jobs } from '@jobber/nestjs';

@Job({
  name: Jobs.FIBONACCI,
  description: 'Generate a Fibonacci sequence and store it in the database',
})
export class FibonacciJob extends AbstractJob<FibonacciMessage> {
  protected messageClass = FibonacciMessage;
  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient);
  }
}
