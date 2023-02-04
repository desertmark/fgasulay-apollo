import { Inject, Injectable, Logger } from '@nestjs/common';
import { SupergraphManager } from '@apollo/gateway/dist/config';
import { SchemaManager } from '../../SupergraphManager';
import { ClientProxy } from '@nestjs/microservices';
import { GatewayEvents, InjectionTokens, SubgraphSchemaEvent } from '../constants';
import { operation, RetryOperation } from 'retry';

@Injectable()
export class GatewayService {
  private discoveryOperation: RetryOperation = operation({ forever: true, factor: 1 });
  public manager: SchemaManager;

  constructor(@Inject(InjectionTokens.Broker) private client: ClientProxy) {
    this.discover();
  }

  build(): SupergraphManager {
    return (this.manager = new SchemaManager({ logger: new Logger('schema-manager') }));
  }

  discover() {
    Logger.log('Discovering subpgraph');
    this.discoveryOperation.attempt(() => {
      Logger.debug('Waiting for subgraph schemas...');
      this.client.emit(GatewayEvents.Discover, {});
      this.discoveryOperation.retry(new Error('Wating for subgraph schemas...'));
    });
  }

  addSchema(endpoint: SubgraphSchemaEvent) {
    this.discoveryOperation.stop();
    Logger.log(`New subgraph`, endpoint);
    this.manager.addSubgraph(endpoint);
  }

  removeSchema(endpoint: SubgraphSchemaEvent) {
    Logger.log(`Subgraph removed`, endpoint);
    this.manager.removeSchema(endpoint);
  }
}
