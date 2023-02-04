/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SubgraphService } from 'fgasulay-apollo';

import { AppModule } from './app.module';
const port = process.env.PORT || 4001;

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

  // const subgraphService = app.get(SubgraphService);
  // const gqlSchema = app.get(GraphQLSchemaHost).schema;
  // subgraphService.setSchema(gqlSchema);
}

bootstrap();
