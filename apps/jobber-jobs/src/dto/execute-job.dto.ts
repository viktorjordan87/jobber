import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsObject } from 'class-validator';
import JSON from 'graphql-type-json';

@InputType()
export class ExecuteJobDto {
  @Field()
  @IsNotEmpty()
  jobName: string;

  @Field(() => JSON)
  @IsObject()
  @IsNotEmpty()
  data: object;
}
