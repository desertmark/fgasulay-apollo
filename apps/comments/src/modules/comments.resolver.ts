import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CommentModel } from './comment.model';

function createComment(postId: number) {
  const comment = new CommentModel();
  comment.id = 1;
  comment.text = 'title';
  comment.postId = postId;
  return comment;
}
@Resolver((type) => CommentModel)
export class CommentsResolver {
  @Query((type) => [CommentModel])
  comments(@Args('postId') postId: number): CommentModel[] {
    return [
      createComment(postId),
      createComment(postId),
      createComment(postId),
    ];
  }
}
