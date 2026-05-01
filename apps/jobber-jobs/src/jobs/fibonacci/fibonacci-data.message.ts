import { IsNotEmpty, IsNumber } from 'class-validator';

export class FibonacciDataMessage {
  @IsNumber()
  @IsNotEmpty()
  iterations: number;
}
