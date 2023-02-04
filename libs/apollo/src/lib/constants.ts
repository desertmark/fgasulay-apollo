export enum InjectionTokens {
  Broker = 'broker',
  SubgraphOptions = 'subgraphOptions',
}

export enum GatewayEvents {
  Discover = 'gateway_discover',
}

export enum SubgraphEvents {
  Schema = 'subgraph_schema',
}
export interface SubgraphSchemaEvent {
  schema: string;
  name: string;
  url: string;
}
