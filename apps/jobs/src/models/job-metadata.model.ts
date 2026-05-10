import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class JobMetadata {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  completed: number;

  @Field()
  size: number;

  @Field()
  status: string;

  @Field()
  started: Date;

  @Field({ nullable: true })
  ended?: Date;
}
