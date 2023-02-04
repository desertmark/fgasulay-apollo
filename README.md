# Apollo Supergraph Manager

In this repository we will found the library [fgasulay-apollo](./libs/apollo) and [example apps](./apps/) showcasing how to consume this library.

NOTE: this repository is based on [NX](nx.dev) workspace manager. Visit <http://nx.dev> for more details

Main goal here is to create two apollo subgraph services each one with its own schema, and one gateway apollo server that will combine both subgraph schemas into one to provide a single endpoint to access the data of both services.

Main functionality is implemented in the [SchemaManager](./libs/apollo/src/lib/SupergraphManager.ts) class of the library. This class is the one you need to provide to ApolloGateway as a `SupergraphManager`.
Its very similar to the `IntrospectAndCompose` but with some differences.

1. You don't need to provide the subgraph's endpoints in the constructor, endpoints can be added using the `addSubgGraph` Method. If the initialized method is called and there aren't any endpoints provided yet, SchemaManager won't throw or make the gateway crash. Instead it will retry forever until you add at least one endpoint. When the first endpoint is provided it will build the supergrpah and let apollo server continue starting up.
2. You can add or remove endpoints even if apollo has already started, by using `addSubgGraph`/`removeSubGraph` methods. If apollo server has already started it will update the supergraph. This means that you can add some communication mechanism like microservices events to your nodes to add or remove this endpoints on the fly so the gateway service does not need to be restarted at any point.

The functionality mention in the bullet point 2 is provided for nestjs applications in the library as well. You will find 2 NestJS modules, the [ApolloGatewayModule](./libs/apollo/src/lib/nestjs/gateway/apollo-gateway.module.ts) and the [ApolloSubgraphModule](./libs/apollo/src/lib/nestjs/subgraph/apollo-subgraph.module.ts)

These two modules are used by the exmaple applications

## Run the examples

1. Install dependencies: `yarn`
2. Run the nats server here used for microservices communication: `docker-compose up`.
3. Run the Gateway: `nx serve gatewa`. See how it waits forever for subgraphs the connect
4. Run the Posts service `nx serve posts`. Check the gateway logs, it should stop waiting and start right away.
5. Run the Comments service `nx serve comments`. Check the gateway playground, it should update the schema, to include the comments schema.

## Build the library

- `nx build apollo`

## Run tests

- `nx test apollo`
