import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ApolloGatewayModule, InjectionTokens } from 'fgasulay-apollo';

@Module({
  imports: [
    ApolloGatewayModule.register({
      apolloServer: {
        playground: true,
      },
      microservice: {
        name: InjectionTokens.Broker,
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    }),
  ],
})
export class AppModule {}
