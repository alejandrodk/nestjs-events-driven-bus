import { Injectable, Type } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { Module } from "@nestjs/core/injector/module";
import { IEventHandler } from "../interfaces";
import { MetadataKeys } from '../enums'

@Injectable()
export class ExplorerService {
  constructor(private modulesContainer: ModulesContainer) { }

  explore(): any {
    const modules = [...this.modulesContainer.values()];
    const events = this.flatMap<IEventHandler>(modules, (instance) => this.filterProvider(instance, MetadataKeys.LINK_EVENT))
    return { events }
  }

  flatMap<T = any>(modules: Module[], callback: (instance: InstanceWrapper) => Type<any> | undefined): Type<T>[] {
    const items = modules.map(module => [...module.providers.values()].map(callback)).reduce((a, b) => a.concat(b), [])
    return items.filter(element => !!element) as Type<T>[]
  }

  filterProvider(
    wrapper: InstanceWrapper,
    metadataKey: string,
  ): Type<any> | undefined {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    return this.extractMetadata(instance, metadataKey);
  }

  extractMetadata(
    instance: Record<string, any>,
    metadataKey: string,
  ): Type<any> | any {
    if (!instance.constructor) {
      return;
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
    return metadata ? (instance.constructor as Type<any>) : undefined;
  }

}