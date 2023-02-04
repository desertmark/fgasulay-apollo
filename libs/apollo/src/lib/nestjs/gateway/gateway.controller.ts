import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SubgraphEvents, SubgraphSchemaEvent } from '../constants';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private gwService: GatewayService) {}

  @EventPattern(SubgraphEvents.Schema)
  handleSubgrpahSchema(@Payload() payload: SubgraphSchemaEvent) {
    this.gwService.addSchema(payload);
  }
}
