var smt_parser = require('./parsers/smt_parser.js')
var repeatParser = require('./parsers/repeatParser.js');

//integrate the sygusSolution into the oldCode
var sygusToCode = function sygusToCode(sygusSolution) {
  if (sygusSolution.trim() == "unknown") {
    console.log("couldnt find a repair");
    //lets run each individual constraint sepeartely 
    return oldCode;
  }
  var fxnDefs = sygusSolution.split("\n").slice(1);
  var extractDef = new RegExp(/\(.*?\)\) [^ ]* /);
  fxnDefs = fxnDefs.map(f => f.replace(extractDef,"").slice(0,-1));
  var newFxn = fxnDefs[0];
  //console.log('begin smt_parsing with newFxn:' + newFxn)
  var newNewJsFxnBody = (smt_parser(newFxn));
  return newNewJsFxnBody;
};
//takes in an array, polish notation form of the sygus solution and outputs identical tree with repeat nodes
function repeatFinder(arrSolution) {
	return repeatParser.treeDupes(arrSolution);
}



module.exports = {
  sygusToCode: sygusToCode,
  repeatFinder: repeatFinder
}

