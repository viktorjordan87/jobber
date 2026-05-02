import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class AbstractModel {
  @Field(() => ID)
  id: number;
}
