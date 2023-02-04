import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostModel {
  @Field((type) => Int)
  id: number;
  @Field()
  title: string;
  @Field()
  body: string;
}
