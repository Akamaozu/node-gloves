var vm = require('vm');

module.exports = function( input, context, filename, callback ){

  var cjsTask = require('cjs-task');
  var task = cjsTask();
  var localizePlugin = require('./localize-plugin');
  var baselineHandles = context.process._getActiveHandles().length;

  var cmd = input.replace('\n', '');
  var cmd_blocks = cmd.split(" && ");

  for (var i = 0; i < cmd_blocks.length; i++) {

    var thisBlock = cmd_blocks[i].trim();

    var pipeBlocks = thisBlock.split(' | ');

    if( pipeBlocks.length < 2 ){      
    
      var script = new vm.Script( 'res=' + localizePlugin( context.__plugins.list(), thisBlock ), { filename: filename });
      var blockName = 'script block ' + (i + 1)

      task.step( blockName, ( function(script, index){

        return function(){

          script.runInContext( context );
          onScriptEnd( function(){
            
            if( index < cmd_blocks.length - 1 && typeof context.res !== 'undefined' ) console.log( context.res ); 
      
            script = new vm.Script( 'res=null', { filename: filename });
            script.runInContext( context );

            task.next(); 
          });
        }
      })(script, i));
    }

    else{

      for (var ii = 0; ii < pipeBlocks.length; ii++) {

        var script = new vm.Script( 'res=' + localizePlugin( context.__plugins.list(), pipeBlocks[ii] ), { filename: filename });
        var blockName = 'script block ' + (i + 1) + ' pipe step ' + (ii + 1);

        task.step( blockName, ( function(script){

          return function(){

            script.runInContext( context );
            onScriptEnd( task.next );
          }
        })(script));
      };
    }
  }

  task.callback( function(){

    if( typeof context.res !== 'undefined' ){

      if( context.res !== null ) console.log( context.res );

      var script = new vm.Script( 'res=null', { filename: filename });
          script.runInContext( context );
    }

    context.displayPrompt();
  });

  task.start();

  function onScriptEnd( callback ){

    if( context.process._getActiveRequests().length > 0 || context.process._getActiveHandles().length > baselineHandles ) return setImmediate( function(){ onScriptEnd(callback); });

    callback();
  }
}