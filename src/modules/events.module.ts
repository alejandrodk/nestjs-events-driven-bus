import { Global, Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { EventsService } from '../services';
import { EventBus } from '../services/eventbus';
import { ExplorerService } from '../services/explorer.service';

@Global()
@Module({
  providers: [EventBus, ExplorerService, EventsService],
  exports: [EventBus],
})
export class EventBusModule implements OnApplicationBootstrap {
  constructor(
    private explorer: ExplorerService,
    private events: EventsService,
  ) {}
  private logger: Logger = new Logger(EventBusModule.name);

  onApplicationBootstrap() {
    if (process.env.DISABLE_EVENT_HANDLING) return;
    
    const { events: eventHandlers } = this.explorer.explore();
    this.events.register(eventHandlers);
    this.logger.log('Events Handlers successfully registered');
  }
}
