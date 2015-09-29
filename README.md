# Apiway - Client side

[**Server side**](https://github.com/4urbanoff/rb.apiway)

## Getting started

```r
# Install
$ npm install apiway --save                
```
```js
// Require
import { Api, Resource, Store } from "apiway";
```

## Hierarchy

```r
EventEmitter 
|
|---> Api             
|
|---> Resource
|
|---> Store
```
[**EventEmitter docs**](https://github.com/4urbanoff/js.event_emitter)

## Api

Api provides an requests interface to actions of controllers server.

### Methods

```js
Api.connect( address[, options ] )
```
Open websocket connection to **Apiway** server, options:
* aliveDelay - seconds between ping sendings, default: 0 (off)

```js
Api.query( "controller.action", params )
```
Make query to controller action on server side with params, return Promise.
```js
Api.send( event, data )
```
Send your custom event with data.
```js
Api.disconnect()
```
Close connection.
```js
Api.beforeReadyPromise( callback )
```
Set a method that returns a promise. Called after the connection and triggering ready/unready events. It can be used for pre-authentication before ready event.
```js
Api.onReady( callback, context )  # call on every trigger
Api.oneReady( callback, context ) # call on first trigger
```
Attach callback with context to "ready" event.
```js
Api.offReady( callback, context )
```
Detach callback with context from "ready" event.
```js
Api.onUnready( callback, context )  # call on every trigger
Api.oneUnready( callback, context ) # call on first trigger
```
Attach callback with context to "unready" event.
```js
Api.offUnready( callback, context )
```
Detach callback with context from "unready" event.

### Example

```js
Api
  .connect( "ws://localhost:3000", { aliveDelay: 5000 } )
  .beforeReadyPromise( function(){
    return Api.query( "Users.auth_by_token", { token: Cookie.get( "token" ) } );
  })
  .oneReady( function(){
    RouterRun();
  });
```
```js
Api.query( "Messages.new", { text: "Hello world!" } )
  .then(  (e)=>{ console.log( "success" ) } )
  .catch( (e)=>{ console.log( "failure" ) } );
```

## Resource

Resources provide access to relevant data and automatically synchronized when they change.

### Create

```js
let resource = new Resource( resourceName, params );
```
Create new resource with params.

### Methods

```
resource.name
```
Getter to resource name.
```
resource.data
```
Getter to resource data.
```
resource.get( paramName )
```
Return value of resource param.
```
resource.set( { paramName: paramValue, paramName: paramValue } )
```
Set values of resource params.
```
resource.unset( paramName )
```
Remove param from resource params.
```js
resource.onChange( callback, context )  # call on every trigger
resource.oneChange( callback, context ) # call on first trigger
```
Attach callback with context to "change" event.
```js
resource.offChange( callback, context )
```
Detach callback with context from "change" event.
```js
resource.onError( callback, context )  # call on every trigger
resource.oneError( callback, context ) # call on first trigger
```
Attach callback with context to "error" event.
```js
resource.offError( callback, context )
```
Detach callback with context from "error" event.

### Example

```js
let currentUser = new Resource( "CurrentUser" );
currentUser
  .onChange( ( data )=>{ console.log( "Data of current user:", data ) })
  .onError( ( error )=>{ console.log( "Error", error ) });

// > Error auth_error

Api.query( "Users.auth_by_name", { name: "Bob" } );

// > Data of current user: {id: 1, name: "Bob"}

let messages = new Resource( "Messages", { limit: 3 } );
messages.onChange( ( data )=>{ console.log( "Messages:", data ) } );

// > Messages [{text: "Hello world"}, {text: "Hello world"}, {text: "Hello world"}]

messages.set({ limit: 2 });

// > Messages [{text: "Hello world"}, {text: "Hello world"}]

messages.get( "limit" );

// > 2
```

## Store

Store is a simple object for the storage data of your application and access to them from different parts of the application.