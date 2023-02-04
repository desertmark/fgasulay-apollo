import { ServiceDefinition, SupergraphManager } from '@apollo/gateway';
import { SupergraphSdlHookOptions, SupergraphSdlUpdateFunction } from '@apollo/gateway/dist/config';
import { Logger } from '@nestjs/common';
import { GatewayService, SchemaDictionary } from './gateway.service';
import { composeServices } from '@apollo/federation';
import { parse } from 'graphql';

export type SupergraphManagerInitResult = {
  supergraphSdl: string;
  cleanup?: () => Promise<void>;
};

export interface SchemaManagerOptions {
  onInit?: () => any;
}
export class SchemaManager implements SupergraphManager {
  private updateSchema: SupergraphSdlUpdateFunction;

  constructor(private gwService: GatewayService) {}

  update(schema: string) {
    this.updateSchema(schema);
  }

  async cleanUp() {
    // TODO: unsubscribe
    console.log('Clean up');
  }

  async initialize({ update }: SupergraphSdlHookOptions): Promise<{
    supergraphSdl: string;
    cleanup?: () => Promise<void>;
  }> {
    this.updateSchema = update;
    return new Promise<SupergraphManagerInitResult>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      this.gwService.discover().subscribe((schemaDictionary) => {
        Logger.debug('Got supergraph sdl!');
        const supergraphSdl = this.buildSchema(schemaDictionary);

        resolve({
          supergraphSdl,
          cleanup: this.cleanUp.bind(this),
        });
      });
    });
  }

  buildSchema(schemaDictionary: SchemaDictionary) {
    const services: ServiceDefinition[] = Object.values(schemaDictionary).map((s) => ({
      name: s.name,
      url: s.url,
      typeDefs: parse(s.schema),
    }));
    return this.createSupergraphFromSubgraphList(services);
  }

  private createSupergraphFromSubgraphList(subgraphs: ServiceDefinition[]) {
    const compositionResult = composeServices(subgraphs);

    if (compositionResult.errors) {
      const { errors } = compositionResult;
      throw Error(
        "A valid schema couldn't be composed. The following composition errors were found:\n" +
          errors.map((e) => '\t' + e.message).join('\n')
      );
    } else {
      const { supergraphSdl } = compositionResult;
      return supergraphSdl;
    }
  }
}
