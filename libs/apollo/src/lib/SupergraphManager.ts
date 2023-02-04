import { ServiceDefinition, SERVICE_DEFINITION_QUERY, SupergraphManager } from '@apollo/gateway';
import { ServiceEndpointDefinition, SupergraphSdlHookOptions } from '@apollo/gateway/dist/config';
import { GraphQLDataSource, GraphQLDataSourceRequestKind } from '@apollo/gateway/dist/datasources/types';
import { operation, RetryOperation } from 'retry';
import { Headers } from 'node-fetch';
import { parse } from 'graphql';
import { composeServices } from '@apollo/composition';

export type SupergraphManagerInitResult = {
  supergraphSdl: string;
  cleanup?: () => Promise<void>;
};

export interface SchemaManagerOptions {
  logger?: Pick<Console, 'log' | 'error' | 'warn' | 'debug'>;
  supergraphSdlCheck?: boolean;
}

export type Service = ServiceEndpointDefinition & { dataSource: GraphQLDataSource };

export class SchemaManager implements SupergraphManager {
  private initOperation: RetryOperation;
  private initOptions: SupergraphSdlHookOptions;
  private initialized = false;
  private services = new Map<string, Service>();

  constructor(private options?: SchemaManagerOptions) {}

  get logger() {
    return this.options?.logger || console;
  }

  async addSubgraph(service: ServiceEndpointDefinition) {
    if (!this.initOptions) {
      throw new Error('Schema manager has not be initialized. Call the initialized method first.');
    }
    this.services.set(service.name, {
      ...service,
      dataSource: this.initOptions.getDataSource(service),
    });
    if (this.initialized) {
      const supergraph = await this.buildSupergraph();
      this.initOptions.update(supergraph);
    }
  }

  async removeSchema(service: ServiceEndpointDefinition) {
    this.services.delete(service.name);
    if (this.initialized) {
      const supergraph = await this.buildSupergraph();
      this.initOptions.update(supergraph);
    }
  }

  async initialize(options: SupergraphSdlHookOptions): Promise<{
    supergraphSdl: string;
    cleanup?: () => Promise<void>;
  }> {
    this.initOptions = options;
    this.initOperation = operation({ factor: 1, forever: true });
    return new Promise((resolve) => {
      this.initOperation.attempt(async () => {
        try {
          const supergraphSdl = await this.buildSupergraph();

          if (this.options?.supergraphSdlCheck) {
            await this.initOptions.healthCheck(supergraphSdl);
          }

          this.logger.log('Super graph builded');
          this.initOperation.stop();
          this.initialized = true;
          resolve({
            supergraphSdl,
            cleanup: () => undefined,
          });
        } catch (error) {
          this.logger.warn(error.message);
          this.initOperation.retry(error);
        }
      });
    });
  }

  /**
   * Builds the super graph for the current service definition.
   */
  private async buildSupergraph(): Promise<string> {
    if (this.services.size === 0) {
      throw new Error('Wating for subgraph...');
    }
    const schemas = await this.fetchSchemas(Array.from(this.services.values()));

    // Parse schema from instrospection query from string into DocumentNode
    const serviceDef: ServiceDefinition[] = schemas.map(({ name, url, schema }) => {
      try {
        return {
          name,
          url,
          typeDefs: parse(schema),
        };
      } catch (error) {
        throw new Error(`Failed to parse subgraph schema: ${error.message}`);
      }
    });

    // Composes the super graph
    const composition = composeServices(serviceDef);
    if (composition.errors) {
      this.logger.error(composition.errors);
      throw new Error(`Failed to compose supergraph`);
    }
    return composition.supergraphSdl;
  }

  /**
   * Fetches schemas from the apollo instrospection query.
   */
  private async fetchSchemas(services: Service[]) {
    const requests = services.map(async (s) => {
      return s.dataSource
        .process({
          kind: GraphQLDataSourceRequestKind.LOADING_SCHEMA,
          context: {},
          request: {
            query: SERVICE_DEFINITION_QUERY,
            http: {
              method: 'POST',
              url: s.url,
              headers: new Headers({}),
            },
          },
        })
        .then((res) => {
          if (res.errors) {
            throw new Error(`Failed to get subgraph schema for service ${s.name}: ${s.url}`);
          }
          console.log('res', res);
          return {
            name: s.name,
            url: s.url,
            schema: res.data._service.sdl as string,
          };
        });
    });
    return await Promise.all(requests);
  }
}
