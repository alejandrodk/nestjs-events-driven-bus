# Nestjs Event-Driven Bus module

Simple, easy and lightweight package for implement Event-Driven bus in a [NestJs Project](https://github.com/nestjs/nest) using reactive programming (RxJs) 🚀

[npm package](https://www.npmjs.com/package/nestjs-event-driven-bus)

## Usage

### 1- Install package

```sh
npm install nestjs-event-driven-bus
# or
yarn add nestjs-event-driven-bus
```

### 2- Import EventBusModule

Import the **EventBusModule** in the module where you want to dispatch events.

```sh
@Module({
  imports: [EventBusModule],
  ...
})
```

For example, assuming you are making a products application.

```sh
@Module({
  imports: [EventBusModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}
```

### 3- Define Events

Following the previous example, we create an event to update the stock of a product with each sale.

```sh
# src/events/products.events.ts

export class UpdateStockEvent {
  constructor(public product: string, public quantity: number) {}
}
```

### 4- Define Event handler

The event handler is a class in charge of reacting to events of a specific type, it must implement the methods defined in the IEventHandler interface.
**The event handler class must extends the **IEventHandler** interface*

```sh
class UpdateStockEventHandler implements IEventHandler
```

An event handler must have two required methods (handle, error) and one optional method (complete).
The **handle** method will be in charge of receiving the event, as you should imagine, the **error** method will receive events if an error occurs, this will allow you to apply certain logic to handle certain cases.
The **complete** method is optional, as it is only executed once the event transmission is complete.

```sh
interface IEventHandler {
  handle: (event: any) => void;
  error: (event: any) => void;
  complete?: () => void;
}
```

To link an event handler with an event, we apply the **HandleEvent** decorator on the class, it receives the class of the event it wants to react to.

```sh
@HandleEvent(UpdateStockEvent)
```

The event handlers be Dependency Injection friendly, so you can import injected dependencies into the class constructor as always.

```sh
constructor(private productsService: ProductsService){}
# or
constructor(@Inject() someDependency: SomeDependency) {}
```

Finally, our Event handler class must looks like

```sh
# src/handlers/products.handlers.ts

@HandleEvent(UpdateStockEvent)
export class UpdateStockEventHandler implements IEventHandler {
  constructor(private productsService: ProductsService){}
  handle(event: UpdateStockEvent) {
    console.log('Hello from handler!!!', UpdateStockEventHandler.name)
    this.productsService.someMethod()...
    #do something business logic...
  }
  error(error: any) {
     #do something...
  }
}
```

### 5- Import Event Handlers in your module

In your events handlers file, you must to export and array with all handlers, or if you preferred, import all of then in the target module, but the first option is the cleanest and easiest way.

```sh
# src/handlers/products.handlers.ts

export const ProductsEventsHandlers = [
  UpdateStockEventHandler, 
  someEventHandler, 
  AnotherEventHandler
]
```

then, simply import the array of Event Handlers in providers array.

```sh
@Module({
  imports: [EventBusModule],
  controllers: [ProductsController],
  providers: [ProductsRepository, ProductsService, ...ProductsEventsHandlers],
  exports: [ProductsService]
})
export class ProductsModule {}
```

### 6- Dispatch events 🚀

In our controller (or wherever you need to produce events), you only need to import the EventBus class, the EventBus class has the **Publish**, **PublishError** and **Complete** methods, which we will use to produce new events.

```sh
# src/controllers/products.controller.ts

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService, private eventBus: EventBus) {}
}
```

To produce a new event, all we have to do is publish a new event using the **Publish** method.
**The publish method receives an event instance and its name.*

```sh
 @Get('sell/:id')
  sellProduct(@Param('id') id: string, @Query() queryParams: any): void {
    const { client, quantity } = queryParams;
    this.eventBus.publish(new UpdateStockEvent(id, client, +quantity))
  }
```

To inform our event handler of an error, we can do so using the PublishError method.

```sh
 @Get('sell/:id')
  sellProduct(@Param('id') id: string, @Query() queryParams: any): void {
    const { client, quantity } = queryParams;
    try {
        # some logic here....
        this.eventBus.publish(new UpdateStockEvent(id, client, +quantity))
        # more logic....
    } catch (err) {
        this.eventBus.publishError(error, UpdateStockEvent.name)
    }
  }
```

___

### One event, many handlers

By implementing an event architecture, your application will be able to react to different events, keeping the components of your application completely decoupled.

Going back to the example of a product store, you could have an event called SellProductEvent, and for the same event have different event handlers, for example:

starting from the event:

```sh
# src/events/products.events.ts

export class SellProductEvent {
  constructor(public productID: string, public quantity: number, public client: string) {}
}
```

we can have these different event handlers:

```sh
# src/handlers/products.handlers.ts

@HandleEvent(SellProductEvent)
export class SellProductEventHandler implements IEventHandler {
  constructor(private productsService: ProductsService){}
  handle(event: SellProductEvent) {
    #process sell...
  }
}

@HandleEvent(SellProductEvent)
export class SendEmailToClient implements IEventHandler {
  constructor(private emailTransport: EmailTransport){}
  handle({ client }: SellProductEvent) {
    #send email to client...
    this.emailTransport.newSellEmail(client)...
  }
}

@HandleEvent(SellProductEvent)
export class UpdateStock implements IEventHandler {
  constructor(private productsService: ProductsService){}
  handle({ productID, quantity }: SellProductEvent) {
    #update product stock...
    this.productsService.updateProductStock(productID, quantity)...
  }
}
```

Look how each event is independent of the others.

### TEST

Disable the event bus in test environments with *DISABLE_EVENT_HANDLING* env variable.
