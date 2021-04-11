import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { Subject, Subscription } from 'rxjs';
import { IEvent } from "../interfaces";
import { v4 as uuid } from 'uuid';

@Injectable()
export class EventBus {
  private subscriptions$ = new Map<string, Subject<any>>()
  private observers$ = new Map<string, { [key: string]: Subscription }>()

  constructor(private moduleRef: ModuleRef) { }

  onModuleDestroy() {
    this.subscriptions$.forEach((subscription) => subscription.unsubscribe())
  }

  subscribe(event: any, handler: any): void {
    const eventName = event.name;
    const handlerName = handler.name as string;

    if (!this.getSubject(eventName)) {
      this.subscriptions$.set(eventName, new Subject());
      this.observers$.set(eventName, {});
    }

    const subject$: Subject<any> = this.getSubject(eventName);
    const observer$ = this.observers$.get(eventName);

    if (observer$) {
      observer$[handlerName] = subject$.subscribe({
        next: (event) => handler.handle(event),
        error: (event) => handler.error(event),
        complete: () => handler.complete && handler.complete()
      })
    }
  }

  unsubscribe(event: any, handler: any, remove: boolean = true): void {
    const eventName = event.name;
    const handlerName = handler.name as string;
    const observer$ = this.observers$.get(eventName);

    if (observer$) {
      observer$[handlerName].unsubscribe();
      observer$[handlerName].closed = true;

      remove && observer$[handlerName].remove(observer$[handlerName])
    }
  }

  publish<T extends IEvent>(event: T, instance: string) {
    const subject$: Subject<T> = this.getSubject(instance);
    subject$.next(event);
  }

  publishError<T>(error: any, instance: string) {
    const subject$: Subject<T> = this.getSubject(instance);
    subject$.error(error);
  }

  complete<T>(instance: string) {
    const subject: Subject<T> = this.getSubject(instance);
    subject.complete();
  }

  private getSubject<T = any>(eventName: string): Subject<T> {
    return this.subscriptions$.get(eventName) as any
  }
}