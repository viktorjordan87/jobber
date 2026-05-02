import { Job } from '../../decorators/job.decorator';
import { AbstractJob } from '../abstract-job';
import { PulsarClient } from '@jobber/pulsar';
import { FibonacciJobData } from './fibonacci.type';
import { FibonacciDataMessage } from './fibonacci-data.message';

@Job({
  name: 'fibonacci',
  description: 'Generate a Fibonacci sequence and store it in the database',
})
export class FibonacciJob extends AbstractJob<FibonacciJobData> {
  protected messageClass = FibonacciDataMessage;
  constructor(pulsarClient: PulsarClient) {
    super(pulsarClient);
  }
}
