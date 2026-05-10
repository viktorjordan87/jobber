import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { JobMessage } from './job.message';

export class FibonacciMessage extends JobMessage {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  iterations: number;
}
