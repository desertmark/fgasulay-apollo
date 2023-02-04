import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { GatewayEvents } from '../constants';
import { SubgraphService } from './subgraph.service';

@Controller()
export class SubgraphController {
  private logger = new Logger(SubgraphController.name);

  constructor(private subgraphService: SubgraphService) {}

  @EventPattern(GatewayEvents.Discover, Transport.NATS)
  handleDiscover() {
    this.logger.verbose('Handle gateway discovery');
    this.subgraphService.publishSchema();
  }
}
