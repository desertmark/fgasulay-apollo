import { ApolloDriverConfig, ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Inject, Module } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory, GraphQLModule } from '@nestjs/graphql';
import { GatewayModule, GatewayService } from './gateway.service';
import { Transport, ClientProviderOptions } from '@nestjs/microservices';
import { InjectionTokens } from './constants';
import { GraphQLOptions } from 'apollo-server-express';

export interface ApolloGatewayModuleOptions {
  microservice: ClientProviderOptions;
  apolloServer: ApolloDriverConfig;
}

const defaultOptions: ApolloGatewayModuleOptions = {
  microservice: {
    name: InjectionTokens.Broker,
    transport: Transport.NATS,
    options: {
      servers: ['nats://localhost:4222'],
    },
  },
  apolloServer: {
    autoSchemaFile: true,
    playground: true,
    cors: true,
  },
};

export class ApolloOptionsFactory implements GqlOptionsFactory<GqlModuleOptions<ApolloGatewayDriver>> {
  constructor(
    @Inject(GatewayService) private gwService: GatewayService,
    @Inject('options') private options: ApolloGatewayModuleOptions
  ) {}
  createGqlOptions(): any {
    return {
      gateway: {
        supergraphSdl: this.gwService.build(),
      },
      server: this.options.apolloServer,
    };
  }
}

@Module({})
export class ApolloGatewayModule {
  static register(options: ApolloGatewayModuleOptions = defaultOptions): DynamicModule {
    const m = GatewayModule.register({ microservice: options.microservice });
    return {
      module: ApolloGatewayModule,
      imports: [
        m,
        GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
          imports: [m],
          driver: ApolloGatewayDriver,
          useClass: ApolloOptionsFactory,
        }),
      ],
    };
  }
}
