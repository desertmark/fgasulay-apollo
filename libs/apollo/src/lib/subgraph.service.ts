import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import { GraphQLModule, GraphQLSchemaHost } from '@nestjs/graphql';
import { EventPattern, Transport } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { GatewayEvents, InjectionTokens, SubgraphEvents, SubgraphSchemaEvent } from './constants';
import { printIntrospectionSchema, printSubgraphSchema } from '@apollo/subgraph/dist/printSubgraphSchema';
import { ApolloSubgrpahModuleOptions } from './apollo-subgraph.module';

@Injectable()
export class SubgraphService {
  constructor(
    @Inject(InjectionTokens.Broker) private client: ClientProxy,
    @Inject(InjectionTokens.SubgraphOptions) private options: ApolloSubgrpahModuleOptions,

    private schemaHost: GraphQLSchemaHost
  ) {}

  publishSchema() {
    const schema = printIntrospectionSchema(this.schemaHost.schema);
    this.client.emit<never, SubgraphSchemaEvent>(SubgraphEvents.Schema, {
      schema,
      name: this.options.subgraphName,
      url: this.options.subgraphUrl,
    });
    Logger.log('Schema publish completed', SubgraphService.name);
  }
}

@Controller()
export class SubgraphController {
  constructor(private subgraphService: SubgraphService) {}

  @EventPattern(GatewayEvents.Discover, Transport.NATS)
  handleDiscover() {
    Logger.verbose('Handle gateway discovery', SubgraphController.name);
    this.subgraphService.publishSchema();
  }
}
