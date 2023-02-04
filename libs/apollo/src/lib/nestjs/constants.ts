export enum InjectionTokens {
  Broker = 'broker',
  SubgraphOptions = 'subgraphOptions',
  GatewayModuleOptions = 'gatewayModuleOptions',
}

export enum GatewayEvents {
  Discover = 'gateway_discover',
}

export enum SubgraphEvents {
  Schema = 'subgraph_schema',
  ServiceDown = 'subgraph_service_down',
}
export interface SubgraphSchemaEvent {
  name: string;
  url: string;
}
