import { Inject, Logger, Module } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { ApolloGatewayModule, InjectionTokens } from 'fgasulay-apollo';

@Module({
  imports: [
    // ClientsModule.register([
    //   {
    //     name: InjectionTokens.Broker,
    //     transport: Transport.NATS,
    //     options: {
    //       servers: ['nats://localhost:4222'],
    //     },
    //   },
    // ]),
    ApolloGatewayModule.register()
  ],
})
export class AppModule {
  // constructor(@Inject(InjectionTokens.Broker) private client: ClientProxy) {}
  async onModuleInit() {
    // Logger.debug('Testing ms');
    // this.client.send('test2', {}).subscribe((res) => {
    //   Logger.debug('test result is', { res });
    // });
  }
}
