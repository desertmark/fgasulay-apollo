import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { ClientsModule, ClientOptions } from '@nestjs/microservices';
import { GraphQLModule } from '@nestjs/graphql';
import { InjectionTokens } from './constants';
import { SubgraphController, SubgraphService } from './subgraph.service';

export interface ApolloSubgrpahModuleOptions {
  subgraphName: string;
  subgraphUrl: string;
  microservice: ClientOptions;
  apolloServer: Omit<ApolloFederationDriverConfig, 'driver'>;
}

@Module({})
export class ApolloSubgraphModule implements OnModuleInit {
  static register(options: ApolloSubgrpahModuleOptions): DynamicModule {
    return {
      module: ApolloSubgraphModule,
      imports: [
        ClientsModule.register([{ ...options.microservice, name: InjectionTokens.Broker }]),
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
          driver: ApolloFederationDriver,
          ...options.apolloServer,
        }),
      ],
      providers: [{ provide: InjectionTokens.SubgraphOptions, useValue: options }, SubgraphService],
      controllers: [SubgraphController],
    };
  }

  constructor(private subgraphService: SubgraphService) {}
  onModuleInit() {
    this.subgraphService.publishSchema();
  }
}
