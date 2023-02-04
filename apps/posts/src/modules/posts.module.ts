import { Module } from '@nestjs/common';
import { PostResolver } from './posts.resolver';

@Module({
  providers: [PostResolver],
  exports: [PostResolver],
})
export class PostModule {}
