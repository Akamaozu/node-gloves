var oldHotkeys, cachedRegex, regexObj, regexString = '';

module.exports = function( hotkeys, string ){

  if( Object.prototype.toString.call( hotkeys ) !== '[object Array]') throw new Error('hotkeys must be an array');

  if( hotkeys.length === 0 ) return string;

  if( hotkeys == oldHotkeys ) regexObj = cachedRegex;

  else{

    var iterations = hotkeys.length;

    for (var i = 0; i < iterations; i++) {

      regexString += hotkeys[i].replace(/(\.)/g, '\\$1');
      
      if( i < iterations - 1) regexString += '|';
    };
    
    regexObj = new RegExp('(' + regexString + ')\\(', 'g');

    cachedRegex = regexObj;
    oldHotkeys = hotkeys;
  }

  return string.replace( regexObj, "__plugins.use('" + "$&" + "',").replace("(',", "',");
}