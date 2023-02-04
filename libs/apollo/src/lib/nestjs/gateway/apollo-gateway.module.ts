import { ApolloDriverConfig, ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Inject, Module } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory, GraphQLModule } from '@nestjs/graphql';
import { GatewayService } from './gateway.service';
import { ClientProviderOptions } from '@nestjs/microservices';
import { GatewayModule } from './gateway.module';
import { InjectionTokens } from '../constants';

export interface ApolloGatewayModuleOptions {
  microservice: ClientProviderOptions;
  apolloServer: ApolloDriverConfig;
}

export class ApolloOptionsFactory implements GqlOptionsFactory<GqlModuleOptions<ApolloGatewayDriver>> {
  constructor(
    @Inject(GatewayService) private gwService: GatewayService,
    @Inject(InjectionTokens.GatewayModuleOptions) private options: ApolloGatewayModuleOptions
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
  static register(options: ApolloGatewayModuleOptions): DynamicModule {
    const GwModule = GatewayModule.register({ microservice: options.microservice });
    return {
      module: ApolloGatewayModule,
      imports: [
        GwModule,
        GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
          imports: [GwModule],
          driver: ApolloGatewayDriver,
          useClass: ApolloOptionsFactory,
        }),
      ],
    };
  }
}
