module.exports = function( context ){
  
  if( Object.prototype.toString.call( context ) !== '[object Object]' ) throw new Error( 'context given must be an object' );

  var fsExtra = require('fs-extra'),
      cjsTask = require('cjs-task'),
      plugins,
      hotkeys;

  var task = cjsTask();

  task.step('get plugin directories', function(){

    var pathToPlugins = [];

    fsExtra.readdir('./plugins', function( err, content ){

      var processed = 0;

      for(var i = 0; i < content.length; i++) {
        
        fsExtra.stat('./plugins/' + content[i], (function(dir){

          return function(err , stat){

            processed += 1;

            if( stat.isDirectory() ) pathToPlugins.push( './plugins/' + dir );

            if(processed === content.length){

              task.set('path-to-plugins', pathToPlugins);
              task.next();
            } 
          }          
        }(content[i])));
      };
    });
  });

  task.step('map plugins', function(){

    var map = {};
    var fail = 0;
    var hotkeys = [];
    var pathToPlugins = task.get('path-to-plugins');

    for (var i = pathToPlugins.length - 1; i >= 0; i--) {
      
      var path = '.' + pathToPlugins[i] + '/index.js';

      try{
        var plugin = require( path );
      }

      catch(e){
        task.log('could not find index.js in "' + pathToPlugins[i] + '"');
        console.log( e );
        continue;
      }

      if( typeof plugin._name !== 'string' ){

        task.log('"' + pathToPlugins[i] + '/index.js" name is not a string');
        fail += 1;
        continue;
      }

      var validator = new RegExp('^[a-zA-Z_-]+$');

      if( !validator.test( plugin._name ) ){

        task.log('"' + plugin._name + '"\'s name contains invalid characters');
        fail += 1;
        continue;
      }

      if( map[ plugin._name ] ){

        task.log('plugin with name "' + plugin._name + '" already exists');
        fail += 1;
        continue;
      }

      if( typeof context[ plugin._name ] !== 'undefined' ){

        task.log('did not load plugin "' + pathToPlugins[i] + '/index.js"\n       name conflicts with global variable "' + plugin._name + '"');
        fail += 1;
        continue;
      }

      map[ plugin._name ] = {}

      for( var key in plugin ){

        if( key === '_name' ) continue;
        if( !plugin.hasOwnProperty( key )) continue;

        map[ plugin._name ][ key ] = plugin[ key ];
        hotkeys.push( plugin._name + '.' + key );
      }
    };

    task.set('plugins', map);
    task.set('hotkeys', hotkeys);
    task.next();
  });

  task.callback( function( err ){

    if( err ){

      console.log('[WARN] COULD NOT LOAD PLUGINS');

      for (var i = 0; i < err.length; i++) {
        console.log( '[ERROR] ' + err[i] ); 
      };

      throw new Error('plugin load error');
    }

    else{

      plugins = task.get('plugins');
      hotkeys = task.get('hotkeys');

      var errorLog = task.log();

      if( errorLog.length > 0 ){

        for (var i = 0; i < errorLog.length; i++) {
          console.log( '\n[WARN] ' + errorLog[i] ); 
        };
      }

      var __plugins = {

        list: function(){

          return hotkeys;
        }, 

        use: function(){

          var args = Array.prototype.slice.call(arguments);
          var plugin = args.shift().split('.');
          var keyspace = plugin[0];
          var method = plugin[1];
          var methodArgs = args;

          if( !plugins[ keyspace ] ) throw new Error('plugin "' + keyspace + '" was not found');
          if( !plugins[ keyspace ][ method ] ) throw new Error( keyspace + ' does not have "' + method + '" method');

          plugins[ keyspace ][ method ].apply( plugins[ keyspace ][ method ], methodArgs );
        }
      }

      context.__plugins = __plugins;
    } 
  });

  task.start();
}