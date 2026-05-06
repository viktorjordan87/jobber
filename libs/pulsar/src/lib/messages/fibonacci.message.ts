import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FibonacciMessage {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  iterations: number;
}
