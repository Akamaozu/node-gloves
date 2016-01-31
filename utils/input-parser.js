var vm = require('vm');

module.exports = function( input, context, filename, callback ){

  var cjsTask = require('cjs-task');
  var task = cjsTask();
  var localizePlugin = require('./localize-plugin');
  var baselineHandles = context.process._getActiveHandles().length;

  var cmd = input.replace('\n', '');
  var cmdBlocks = require('./expression-block-interpreter')( cmd );

  var thisBlock, pipeBlocks;

  for (var i = 0; i < cmdBlocks.length; i++){

    thisBlock = cmdBlocks[i].trim();

    pipeBlocks = thisBlock.split(' | ');

    if( pipeBlocks.length < 2 ){      
      
      var blockName = 'script block ' + (i + 1);
    
      task.step( blockName, ( function(index, thisBlock, blockName){

        var script = new vm.Script( 'res=' + localizePlugin( context.__plugins.list(), thisBlock ), { filename: filename });

        return function(){

          script.runInContext( context );
          onScriptEnd( function(){
            
            if( typeof context.res !== 'undefined' ) console.log( context.res ); 
      
            script = new vm.Script( 'res=null', { filename: filename });
            script.runInContext( context );

            task.next(); 
          });
        }
      })(i, thisBlock, blockName));
    }

    else{

      for(var ii = 0; ii < pipeBlocks.length; ii++) {

        var blockName = 'script block ' + (i + 1) + ' pipe step ' + (ii + 1);
        
        task.step( blockName, ( function(index, pipeBlocks, blockName){

          var script = new vm.Script( 'res=' + localizePlugin( context.__plugins.list(), pipeBlocks[ii] ), { filename: filename });
          
          return function(){

            script.runInContext( context );

            onScriptEnd( function(){

              if( index === pipeBlocks.length - 1 ){

                if( typeof context.res !== 'undefined' ) console.log( context.res );
              
                script = new vm.Script( 'res=null', { filename: filename });
                script.runInContext( context );
              }

              task.next(); 
            });
          }
        })(ii, pipeBlocks, blockName));
      };
    }
  }

  task.callback( context.displayPrompt );

  task.start();

  function onScriptEnd( callback ){

    if( context.process._getActiveRequests().length > 0 || context.process._getActiveHandles().length > baselineHandles ) return setImmediate( function(){ onScriptEnd(callback); });

    callback();
  }
}