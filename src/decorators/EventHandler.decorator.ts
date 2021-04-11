import 'reflect-metadata';
import { MetadataKeys } from '../enums'; 

export const HandleEvent = (...events: any[]): ClassDecorator => {
  return(target: any) => {
    Reflect.defineMetadata(MetadataKeys.LINK_EVENT, events, target);
    return target;
  }
}