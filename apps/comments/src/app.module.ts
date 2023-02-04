import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ApolloSubgraphModule } from 'fgasulay-apollo';
import { CommentsModule } from './modules/comments.module';

@Module({
  imports: [
    ApolloSubgraphModule.register({
      subgraphName: 'comments',
      subgraphUrl: 'http://localhost:4002/graphql',
      apolloServer: {
        autoSchemaFile: true,
        playground: true,
      },
      microservice: {
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    }),
    CommentsModule,
  ],
  providers: [],
})
export class AppModule {}
