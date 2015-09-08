import Private           from "js.private";
import EventEmitter      from "js.event_emitter";
import Api               from "./Api"
import { API, RESOURCE } from "./Events";


let nextId = 0;


class Resource extends EventEmitter {

  constructor( name, params = {} ){
    super();
    $( this ).id     = nextId++;
    $( this ).name   = name;
    $( this ).params = params;
    $( this ).data   = null;
    $( this ).switchHandlersTo( `on` );
    $( this ).sync();
  }

  get name(){
    return $( this ).name;
  }

  get data(){
    return $( this ).data;
  }

  get( name ){
    return $( this ).params[ name ];
  }

  set( params ){
    let isChanged  = false;
    for( name in params ){
      if( !params.hasOwnProperty( name ) || $( this ).params[ name ] == params[ name ] ) continue;
      $( this ).params[ name ] = params[ name ];
      isChanged = true;
    }
    if( isChanged ) $( this ).sync();
    return this;
  }

  unset( name ){
    delete $( this ).params[ name ]
    $( this ).sync();
    return this;
  }

  destroy(){
    this.off();
    $( this ).switchHandlersTo( `off` );
    Api.send( RESOURCE.DESTROY, { id: $( this ).id } );
    $.destroy( this );
    return this;
  }

  onChange( callback, context ){
    this.on( RESOURCE.CHANGE, callback, context );
    return this;
  }

  oneChange( callback, context ){
    this.one( RESOURCE.CHANGE, callback, context );
    return this;
  }

  offChange( callback, context ){
    this.off( RESOURCE.CHANGE, callback, context );
    return this;
  }

  onError( callback, context ){
    this.on( RESOURCE.ERROR, callback, context );
    return this;
  }

  oneError( callback, context ){
    this.one( RESOURCE.ERROR, callback, context );
    return this;
  }

  offError( callback, context ){
    this.off( RESOURCE.ERROR, callback, context );
    return this;
  }

}


const $ = Private({

  id:       null,
  name:     null,
  params:   null,
  data:     null,
  jsonData: '',

  switchHandlersTo: function( method ){
    Api[ method ]( API.READY,     HANDLERS[ API.READY ],     this );
    Api[ method ]( RESOURCE.SYNC, HANDLERS[ RESOURCE.SYNC ], this );
  },

  sync: function(){
    let [ id, name, params ] = [ $( this ).id, $( this ).name, $( this ).params ];
    Api.send( RESOURCE.SYNC, { id, name, params } );
  },

  applyDataPatch: function( patch ){
    let [ del, add ] = patch,
        jsonDataArr  = $( this ).jsonData.split( `` );
    for( let index in del ) jsonDataArr.splice( index, del[ index ] );
    for( let index in add ) Array.prototype.splice.apply( jsonDataArr, [ index, 0 ].concat( add[ index ].split( `` ) ) );
    let jsonData = jsonDataArr.join( `` );
    $( this ).jsonData = jsonData;
    $( this ).replaceData( JSON.parse( jsonData ) );
  },

  applyDataFull: function( data ){
    $( this ).jsonData = JSON.stringify( data );
    $( this ).replaceData( data );
  },

  replaceData: function( data ){
    $( this ).data = data;
    this.trigger( RESOURCE.CHANGE );
  }

});


const HANDLERS = {

  [ API.READY ]: function( data ){
    $( this ).sync.call( this );
  },

  [ RESOURCE.SYNC ]: function( data ){
    if( data.id == $( this ).id ){
      if( data.patch ) $( this ).applyDataPatch( data.patch );
      else
      if( data.full )  $( this ).applyDataFull( data.full );
      else
      if( data.error ) this.trigger( RESOURCE.ERROR, data.error );
    }
  }

};


export default Resource;
