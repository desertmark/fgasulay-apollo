import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectionTokens, SubgraphEvents, SubgraphSchemaEvent } from '../constants';
import { ApolloSubgrpahModuleOptions } from './apollo-subgraph.module';

@Injectable()
export class SubgraphService {
  private logger = new Logger(SubgraphService.name);
  constructor(
    @Inject(InjectionTokens.Broker) private client: ClientProxy,
    @Inject(InjectionTokens.SubgraphOptions) private options: ApolloSubgrpahModuleOptions
  ) {}

  publishSchema() {
    this.client.emit<never, SubgraphSchemaEvent>(SubgraphEvents.Schema, {
      name: this.options.subgraphName,
      url: this.options.subgraphUrl,
    });
    this.logger.log('Schema endpoint publish completed');
  }
}
