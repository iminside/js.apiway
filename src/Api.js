import Promise      from "native-promise-only";
import Private      from "js.private";
import EventEmitter from "js.event_emitter";
import { API }      from "./Events";


class Api extends EventEmitter {

  connect( address, options = {} ){
    this.address    = address;
    this.aliveDelay = options.aliveDelay || 0;
    $( this ).dispatch();
    return this;
  }

  beforeReadyPromise( callback ){
    $( this ).beforeReadyPromiseCallback = callback;
    return this;
  }

  send( event, data = null ){
    if( $( this ).dispatcher.readyState === $( this ).dispatcher.OPEN )
      $( this ).dispatcher.send( JSON.stringify({ event, data }) );
    return this;
  }

  query( to, params = {} ){
    let [ name, action ] = to.split( `.` ),
        callbacks        = {},
        query_id         = $( this ).journal.push( callbacks ) - 1;
    this.send( API.QUERY, { name, action, params, query_id } );
    return new Promise( ( resolve, reject ) => { [ callbacks.success, callbacks.failure ] = [ resolve, reject ] });
  }

  disconnect(){
    $( this ).dispatcher.close();
    return this;
  }

  onReady( callback, context ){
    this.on( API.READY, callback, context );
    return this;
  }

  oneReady( callback, context ){
    this.one( API.READY, callback, context );
    return this;
  }

  offReady( callback, context ){
    this.off( API.READY, callback, context );
    return this;
  }

  onUnready( callback, context ){
    this.on( API.UNREADY, callback, context );
    return this;
  }

  oneUnready( callback, context ){
    this.one( API.UNREADY, callback, context );
    return this;
  }

  offUnready( callback, context ){
    this.off( API.UNREADY, callback, context );
    return this;
  }

}


const $ = Private({

  dispatcher:     null,
  journal:        [],
  aliveTimer:     0,
  reconnectDelay: 0,

  beforeReadyPromiseCallback: function(){
    return Promise.resolve();
  },

  dispatch: function( e ){
    $( this ).dispatcher           = new WebSocket( this.address );
    $( this ).dispatcher.onopen    = $( this ).onOpen;
    $( this ).dispatcher.onclose   = $( this ).onClose;
    $( this ).dispatcher.onerror   = $( this ).onError;
    $( this ).dispatcher.onmessage = $( this ).onMessage;
  },

  onOpen: function( e ){
    console.info( `Api connected to "${ this.address }"`);
    $( this ).reconnectDelay = 0;
    $( this ).callHandler( API.ALIVE );
    let beforeReadyPromise = $( this ).beforeReadyPromiseCallback();
    if( beforeReadyPromise instanceof Promise ){
      beforeReadyPromise.then(
        ( e )=>{ this.trigger( API.READY,   e ) },
        ( e )=>{ this.trigger( API.UNREADY, e ) }
      );
    }else console.warn( `BeforeReadyPromise must be return instance of Promise` );
  },

  onError: function( e ){
    console.warn( `Api connection error` );
    this.trigger( API.ERROR, e );
  },

  onClose: function( e ){
    console.warn( `Api disconnected from "${ this.address }"` );
    setTimeout( $( this ).dispatch.bind( this ), $( this ).reconnectDelay * 100 );
    $( this ).reconnectDelay += 1;
    this.trigger( API.DISCONNECT, e );
  },

  onMessage: function( e ){
    let message = JSON.parse( e.data );
    $( this ).callHandler( message.event, message.data );
  },

  callHandler: function( event, args ){
    let handler = HANDLERS[ event ];
    if( handler ) handler.call( this, args );
  }

});


const HANDLERS = {

  [ API.ALIVE ]: function( data ){
    if( $( this ).aliveTimer )
      clearTimeout( $( this ).aliveTimer );
    if( this.aliveDelay )
      $( this ).aliveTimer = setTimeout( ()=>{ $( this ).aliveTimer = null; this.send( API.ALIVE ); }, this.aliveDelay );
  },

  [ API.SUCCESS ]: function( data ){
    $( this ).journal[ data.query_id ].success.call( this, data.result );
    delete $( this ).journal[ data.query_id ];
  },

  [ API.FAILURE ]: function( data ){
    $( this ).journal[ data.query_id ].failure.call( this, data.result );
    delete $( this ).journal[ data.query_id ];
  },

  [ API.TRIGGER ]: function( data ){
    this.trigger.apply( this, data.args );
  }

};


export default new Api;
