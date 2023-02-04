import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ApolloSubgraphModule } from 'fgasulay-apollo';
import { PostModule } from './modules/posts.module';

@Module({
  imports: [
    ApolloSubgraphModule.register({
      subgraphName: 'posts',
      subgraphUrl: 'http://localhost:4001/graphql',
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
    PostModule,
  ],
  providers: [],
})
export class AppModule {}
