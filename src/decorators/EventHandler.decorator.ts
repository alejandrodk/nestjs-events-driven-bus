import 'reflect-metadata';
import { MetadataKeys } from '../enums'; 

export const HandleEvent = (...events: any[]): ClassDecorator => {
  return(target: any) => {
    if (!process.env.DISABLE_EVENT_HANDLING) {
      Reflect.defineMetadata(MetadataKeys.LINK_EVENT, events, target);
    }
    return target;
  }
}