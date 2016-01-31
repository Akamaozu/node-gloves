module.exports = function( context ){
  
  if( Object.prototype.toString.call( context ) !== '[object Object]' ) throw new Error( 'context given must be an object' );

  var fsExtra = require('fs-extra'),
      cjsTask = require('cjs-task'),
      plugins,
      hotkeys;

  var task = cjsTask( function( err ){

    if( err ){

      console.log('[WARN] COULD NOT LOAD ALL PLUGINS');

      for (var i = 0; i < err.length; i++) {
        console.log( '[ERROR] ' + err[i].toUpperCase() ); 
      };
    }

    else{

      plugins = task.get('plugins');
      hotkeys = task.get('hotkeys');

      var errorLog = task.log();

      if( errorLog.length > 0 ) console.log( errorLog );

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

      if( map[ plugin._name ] ){

        task.log('plugin with name "' + plugin._name + '" already exists');
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

  task.start();
}