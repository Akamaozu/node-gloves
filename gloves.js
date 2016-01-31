var repl = require('repl');

var instance = repl.start({

  prompt: 'gloves > ',
  eval: require('./utils/input-parser')
});

instance.context.displayPrompt = function(){ instance.displayPrompt(); }

require('./utils/load-plugins')( instance.context );

instance.context.displayPrompt();