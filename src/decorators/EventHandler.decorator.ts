import 'reflect-metadata';
import { MetadataKeys } from '../enums'; 

export const EventHandlerDecorator = (...events: any[]): ClassDecorator => {
  return(target: any) => {
    Reflect.defineMetadata(MetadataKeys.LINK_EVENT, events, target);
    return target;
  }
}