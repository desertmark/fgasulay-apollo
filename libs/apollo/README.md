# Apollo Supergrpah Manager imeplementation

## Usage

### Subgraph

In your entry module:

```typescript
import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ApolloSubgraphModule } from 'fgasulay-apollo';
import { PostModule } from './modules/posts.module';

@Module({
  imports: [
    ApolloSubgraphModule.register({
      subgraphName: 'posts',
      subgraphUrl: 'http://localhost:4001/graphql',
      apolloServer: {
        autoSchemaFile: true,
        playground: true,
      },
      microservice: {
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    }),
    PostModule,
  ],
  providers: [],
})
export class AppModule {}
```

in your main file:

```typescript
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
const port = process.env.PORT || 4001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app
    .connectMicroservice<MicroserviceOptions>({
      transport: Transport.NATS,
      options: {
        servers: ['nats://localhost:4222'],
      },
    })
    .enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();

```

### Gateway

In your entry module:

```typescript
import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ApolloGatewayModule, InjectionTokens } from 'fgasulay-apollo';

@Module({
  imports: [
    ApolloGatewayModule.register({
      apolloServer: {
        playground: true,
      },
      microservice: {
        name: InjectionTokens.Broker,
        transport: Transport.NATS,
        options: {
          servers: ['nats://localhost:4222'],
        },
      },
    }),
  ],
})
export class AppModule {}
```

In your main file

```typescript
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: ['nats://localhost:4222'],
    },
  });
  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();

```
