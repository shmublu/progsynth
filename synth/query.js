var execSync = require('child_process').execSync, cvc4Output;
var sygProc = require('./sygusProcessing.js');
var smt_parser = require('./parsers/smt_parser.js');
fs = require('fs');

function sygusQuery(inputs, outputs, dirName = "../queries") {
//first, try and run it with all the constraints.
	var query = buildQuery(inputs, outputs, dirName);
	var queryOutput = runQuery(query);
//if it doesn't error, great!
	if(Boolean(queryOutput)) {
		return sygProc.sygusToCode(queryOutput);
	}
//if it does, let's try running every constraint individually.
	else {
		var arrayOfSols = new Array();
		for(var i = 0; i > -1; i++) {
			if(!!buildQuery(dirName, i)) {
				arrayOfSols[i] = runQuery(buildQuery(dirName,i));
				arrayOfSols[i] = sygProc.sygusToCode(arrayOfSols[i]);
				arrayOfSols[i] = sygProc.repeatFinder(arrayOfSols[i]);
		}
			else {
				break;
			}
		}
		if( sygProc.areSolsIdentical(arrayOfSols)) {
			var newConstraints= sygProc.getLoopRep(arrayOfSols);
			console.log(newConstraints);
			return newConstraints;
		}
		return null;
		
		
	}
}

function runQuery(queryString="", queryFilePath='./queries/query.sl') {
	if(queryString!=="") {
	fs.writeFileSync(queryFilePath, queryString, "utf8");
	}
	try{
		cvc4Output = execSync('doalarm () { perl -e \'alarm shift; exec @ARGV\' "$@"; }\n doalarm 1 cvc4 '+queryFilePath).toString();
		return cvc4Output;
	}
	catch(error) {
	console.error(error);
	return false;
	}
}

/*Takes a directory name and looks for queryTemplate.sl and constraints.sl. If constraintNumber>-1, it builds a query using just that constraint
function buildQueryOLD(dirName="../queries", constraintNumber=-1) {
var body = fs.readFileSync(dirName + "/queryTemplate.sl","utf8");
body = body.split("#PART#\n");
var constraints = fs.readFileSync(dirName + "/constraints.sl","utf8"); 
if(constraintNumber < 0) {
	return body[0] + constraints + body[1];	
}
else {
	constraints = constraints.split("\n");
	if(constraints.length-1 > constraintNumber) {
		return body[0] + constraints[constraintNumber] + body[1];
	}
	else {
		return null;
	}
}

} */

//Takes a directory name and looks for queryTemplate.sl and constraints.sl. If constraintNumber>-1, it builds a query using just that constraint
function buildQuery(inputs, outputs, dirName="./queries", constraintNumber=-1) {
var body = fs.readFileSync(dirName + "/queryTemplate.sl","utf8");
body = body.split("#PART#\n");
var constraints = buildConstraints(inputs,outputs);
if(constraintNumber < 0) {
	return body[0] + constraints + body[1];	
}
else {
	constraints = constraints.split("\n");
	if(constraints.length-1 > constraintNumber) {
		return body[0] + constraints[constraintNumber] + body[1];
	}
	else {
		return null;
	}
}

}
//Takes an array of inputs and outputs and puts them together in a string, separated by newlines
function buildConstraints(arrayOfInputs, arrayOfOutputs, functionName = "f") {
var b = "(constraint (= (" + functionName+ " ";
var m = ") ";
var e = "))\n";
var constraints = "";
for(var i = 0; (i < arrayOfInputs.length && i < arrayOfOutputs.length); i++) {
	var constraint = b+ arrayOfInputs[i] +m + arrayOfOutputs[i] + e;
	constraints = constraints + constraint
}
return constraints;


}
module.exports = {
  runQuery: runQuery,
  buildQuery: buildQuery,
  sygusQuery: sygusQuery
}
