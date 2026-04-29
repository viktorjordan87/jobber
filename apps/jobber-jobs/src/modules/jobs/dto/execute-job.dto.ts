import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ExecuteJobDto {
  @Field()
  @IsNotEmpty()
  jobName: string;
}
