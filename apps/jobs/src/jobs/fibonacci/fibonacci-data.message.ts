import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FibonacciDataMessage {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  iterations: number;
}
