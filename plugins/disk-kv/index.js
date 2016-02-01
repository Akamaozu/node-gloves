module.exports = {

  _name: "disk-kv",  
  get: get,
  set: set
}

function get( key, callback ){
  
  if( typeof key !== 'string' ) throw new Error('key must be a string');

  var cjsTask = require('cjs-task'),
      fsExtra = require('fs-extra');

  var task = cjsTask( function( err ){

    if( err ) return console.log( err );
    
    if( typeof callback == 'function' ) callback( task.get('value') );

    else console.log({[key]: task.get('value')});
  });

  task.step('verify stash.json exists', function(){

    fsExtra.ensureFile( __dirname + '/stash.json', function( err ){

      if( err ) return task.end('could not verify stash.json exists');

      task.set('path-to-stash', __dirname + '/stash.json');
      task.next();
    });
  });

  task.step('import stash.json', function(){

    fsExtra.readJson( task.get('path-to-stash'), function( err, stash ){

      if( err ) stash = {};
      if( Object.prototype.toString.call( stash ) !== '[object Object]' ) stash = {};

      task.set('stash', stash);
      task.next();
    });
  });

  task.step('get from stash', function(){

    fsExtra.readJson( task.get('path-to-stash'), function( err, stash ){

      var stash = task.get('stash');

      var value = stash[ key ];

      task.set('value', value);

      task.next();
    });
  });

  task.start();
}

function set( key, value, callback ){
  
  if( typeof key !== 'string' ) throw new Error('key must be a string');

  var cjsTask = require('cjs-task'),
      fsExtra = require('fs-extra');

  var task = cjsTask( function( err, ok){

    if( err ) return console.log( err );

    if( typeof callback == 'function' ) callback({
      
      key: key,
      value: value
    });

    else console.log( key + ' = ' + value );
  });

  task.step('verify stash.json exists', function(){

    fsExtra.ensureFile( __dirname + '/stash.json', function( err ){

      if( err ) return task.end('could not verify stash.json exists');

      task.set('path-to-stash', __dirname + '/stash.json');
      task.next();
    });
  });

  task.step('import stash.json', function(){

    fsExtra.readJson( task.get('path-to-stash'), function( err, stash ){

      if( err ) stash = {};
      if( Object.prototype.toString.call( stash ) !== '[object Object]' ) stash = {};

      task.set('stash', stash);
      task.next();
    });
  });

  task.step('save value to stash', function(){

    fsExtra.readJson( task.get('path-to-stash'), function( err, stash ){

      var stash = task.get('stash');

      stash[ key ] = value;

      task.next();
    });
  });

  task.step('persist stash to disc', function(){

    fsExtra.outputJson( task.get('path-to-stash'), task.get('stash'), function( err ){

      if( err ) return task.end('could not save to stash.json');

      task.next();
    });
  });

  task.start();
}