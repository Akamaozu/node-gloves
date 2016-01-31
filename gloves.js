var repl = require('repl');

var instance = repl.start({

  prompt: 'gloves > ',
  eval: require('./utils/input-parser')
});

instance.context.displayPrompt = function(){ instance.displayPrompt(); }

var baselineHandles = process._getActiveHandles().length;

require('./utils/load-plugins')( instance.context );

onSetupComplete( function(){

  instance.displayPrompt(); 
});

function onSetupComplete( callback ){

  if( process._getActiveRequests().length > 0 || process._getActiveHandles().length > baselineHandles ) return setImmediate( function(){ onSetupComplete( callback ); });

  callback();
}