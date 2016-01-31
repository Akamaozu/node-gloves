module.exports = function( expression ){
  
  if( typeof expression !== 'string' ) throw new Error( 'javascript expression must be a string' );

  var blocks = [];
  var expressionLength = expression.length;

  var comparisonIndex = 0, index;

  while( comparisonIndex < expressionLength ){

    index = comparisonIndex;
    comparisonIndex += 1;

    // filter non-pipe characters
      if( expression[ index ] !== '|' ) continue;

    // filter unpaired pipes 
      if( expression[ index + 1] === '|' || expression[ index - 1 ] === '|' ) continue;

    // filter empty blocks
      if( typeof expression[ index - 1] === 'undefined') continue;

    // save expression and continue parsing string
      blocks.push( expression.substring(0, index) );

      expression = expression.substring( index + 1 );
      expressionLength = expression.length;
      comparisonIndex = 0;
  }

  // add last expression
    if( expression.length > 1 ) blocks.push( expression );

  return blocks;
}