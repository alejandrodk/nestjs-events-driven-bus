import { Injectable, Logger } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { MetadataKeys } from "../enums";
import { IEventHandler } from "../interfaces";
import { EventBus } from "./eventbus";

@Injectable()
export class EventsService {
  private logger: Logger = new Logger(EventsService.name);
  constructor(private eventBus: EventBus, private moduleRef: ModuleRef) { }

  register(handlers: IEventHandler[]): void {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  registerHandler(handler: IEventHandler) {
    const events: any[] = Reflect.getMetadata(MetadataKeys.LINK_EVENT, handler);

    if (!events.length) {
      this.logger.warn(`No events found for handler: ${handler.name}`);
      return;
    }

    const instance = this.moduleRef.get(handler.name as string, { strict: false });
    events.map(event => this.eventBus.subscribe(event, instance));
  }
}