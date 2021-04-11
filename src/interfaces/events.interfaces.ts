export interface IEventHandler {
  name?: string;
  handle: (event: any) => void;
  error: (event: any) => void;
  complete?: () => void;
}

export interface IEvent {}