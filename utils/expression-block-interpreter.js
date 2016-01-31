module.exports = function( expression ){
  
  if( typeof expression !== 'string' ) throw new Error( 'javascript expression must be a string' );

  var naiveExpressionSplit = expression.split('&&');
  var totalNaive = naiveExpressionSplit.length;
  var reconstructedSplit = [];

  for( var i = 0; i < totalNaive; i += 1 ){

    var currentPiece = naiveExpressionSplit[i];

    // quick filter absence of if( ) or ( ) 
      if( currentPiece.indexOf('(') === -1 ){

        reconstructedSplit.push( currentPiece );
        continue;
      }

    // walk backwards to see if open bracket is closed before &&
      var ii = currentPiece.length - 1;

      while( ii > -1 ){

        // closing bracket found ... treat && as expression block creater
          if( currentPiece[ ii ] === ')' ){

            reconstructedSplit.push( currentPiece );
            break;
          }

        // open bracket found ... treat && as javascript token
          if( currentPiece[ ii ] === '(' ){

            naiveExpressionSplit[i + 1] = currentPiece + '&&' + naiveExpressionSplit[i + 1];
            break;
          }

        ii -= 1;
      }
  }

  return reconstructedSplit;
}