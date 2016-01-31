var oldHotkeys, cachedRegex, regexObj, regexString = '';

module.exports = function( hotkeys, string ){

  if( hotkeys == oldHotkeys ) regexObj = cachedRegex;

  else{

    var iterations = hotkeys.length;

    for (var i = 0; i < iterations; i++) {

      regexString += hotkeys[i].replace('.', '\\.');
      
      if( i < iterations - 1) regexString += '|';
    };
    
    regexObj = new RegExp('(' + regexString + ')\\(', 'g');

    cachedRegex = regexObj;
    oldHotkeys = hotkeys;
  }

  return string.replace( regexObj, "__plugins.use('" + "$&" + "',").replace("(',", "',");
}