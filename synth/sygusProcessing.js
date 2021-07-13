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
//takes an array of array form ASTs and test if they are the same, providing an acception for the loop repitition amount
function areSolsIdentical(listOfTrees) {
	return repeatParser.repeatComparer(listOfTrees);
}
//Takes an array of tree form ASTs. If areSolsIdentical ==true, return a list of the loop repitition amounts
//ASSERT: root node is a repeat node
//TODO: make it work without this assertion
function getLoopRep(listOfTrees) {
	for(var i = 0; i < listOfTrees.length; i++) {
		listOfTrees[i]=repeatParser.turnTreeToArray(listOfTrees[i]);
		listOfTrees[i]=listOfTrees[i][2];
	}
	return listOfTrees;
}

//Takes an array of array form ASTs. If areSolsIdentical ==true, return a list of the loop repitition amounts
//ASSERT: root node is a repeat node
//TODO: make it work without this assertion
function getLoopRept(listOfTrees) {
	for(var i = 0; i < listOfTrees.length; i++) {
		listOfTrees[i]=listOfTrees[i][2];
	}
	return listOfTrees;
}

//Takes an array-form AST loop condition and an array-form AST loop. Splices the first argument into the loop condition of the repeat node.
//ASSERT: root node of second arguement is a repeat node
//TODO: make it work without this assertion(find repeat node, splice in)
function injectLoopCond(loopCond, repeatAST) {
	repeatAST[2] = loopCond;
	return repeatAST;
}


module.exports = {
  sygusToCode: sygusToCode,
  repeatFinder: repeatFinder,
  areSolsIdentical: areSolsIdentical,
  getLoopRep: getLoopRep,
  getLoopRept: getLoopRept,
  injectLoopCond: injectLoopCond
}

