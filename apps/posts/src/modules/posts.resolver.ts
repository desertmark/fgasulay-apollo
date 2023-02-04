import { Post } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { PostModel } from './post.model';
function createPost() {
  const post = new PostModel();
  post.id = 1;
  post.title = 'title';
  post.body = 'Some descrition about this post';
  return post;
}
@Resolver((type) => PostModel)
export class PostResolver {
  @Query((type) => [PostModel])
  posts(): PostModel[] {
    return [createPost(), createPost(), createPost()];
  }
}
