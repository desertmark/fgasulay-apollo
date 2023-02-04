import { Controller, DynamicModule, Inject, Injectable, Logger, Module, Scope } from '@nestjs/common';
import { SupergraphManager } from '@apollo/gateway/dist/config';
import { SchemaManager } from './SupergraphManager';
import { ClientsModule, ClientProxy, ClientProviderOptions, EventPattern, Payload } from '@nestjs/microservices';
import { GatewayEvents, InjectionTokens, SubgraphEvents, SubgraphSchemaEvent } from './constants';
import { Observable, retry, Subject } from 'rxjs';
import { operation, RetryOperation } from 'retry';
export type SchemaDictionary = Record<string, SubgraphSchemaEvent>;

@Injectable()
export class GatewayService {
  private discoveryOperation: RetryOperation = operation({ forever: true, factor: 1 });
  public manager: SchemaManager;
  public schemas: SchemaDictionary = {};
  private schemas$ = new Subject<SchemaDictionary>();
  constructor(@Inject(InjectionTokens.Broker) private client: ClientProxy) {
    console.log('GW Service');
  }

  build(): SupergraphManager {
    this.manager = new SchemaManager(this);
    return this.manager;
  }

  discover(): Observable<SchemaDictionary> {
    Logger.log('Discovering subpgraph');
    this.discoveryOperation.attempt(() => {
      Logger.debug('Waiting for subgraph schemas...');
      this.client.emit(GatewayEvents.Discover, {});
      this.discoveryOperation.retry(new Error('Wating for subgraph schemas...'));
    });
    return this.schemas$.asObservable();
  }

  addSchema(schema: SubgraphSchemaEvent) {
    this.discoveryOperation.stop();
    Logger.log(`New subgraph`, { name: schema.name, url: schema.url });
    this.schemas[schema.name] = schema;
    this.schemas$.next(this.schemas);
  }
}

@Controller()
export class GatewayController {
  constructor(private gwService: GatewayService) {}
  @EventPattern(SubgraphEvents.Schema)
  handleSubgrpahSchemaPublish(@Payload() payload: SubgraphSchemaEvent) {
    this.gwService.addSchema(payload);
  }
}

@Module({})
export class GatewayModule {
  static register(options: { microservice: ClientProviderOptions }): DynamicModule {
    const providers = [GatewayService, { provide: 'options', useValue: options }];
    return {
      module: GatewayModule,
      imports: [ClientsModule.register([options.microservice])],
      providers,
      controllers: [GatewayController],
      exports: providers,
    };
  }
}
