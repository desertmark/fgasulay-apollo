import { Module, DynamicModule } from '@nestjs/common';
import { ClientProviderOptions, ClientsModule } from '@nestjs/microservices';
import { InjectionTokens } from '../constants';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

export interface GatewayModuleOptions {
  microservice: ClientProviderOptions;
}
@Module({})
export class GatewayModule {
  static register(options: GatewayModuleOptions): DynamicModule {
    const providers = [GatewayService, { provide: InjectionTokens.GatewayModuleOptions, useValue: options }];
    return {
      module: GatewayModule,
      imports: [ClientsModule.register([options.microservice])],
      providers,
      controllers: [GatewayController],
      exports: providers,
    };
  }
}
