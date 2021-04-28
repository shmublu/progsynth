var execSync = require('child_process').execSync, cvc4Output;
var sygProc = require('./sygusProcessing.js');
var smt_parser = require('./parsers/smt_parser.js');
fs = require('fs');
const v8 = require('v8');
const structuredClone = obj => {  return v8.deserialize(v8.serialize(obj));};

function sygusQuery(inputs, outputs, dirName = "../queries", skipInitialQuery = 0 ) {
//first, try and run it with all the constraints.
	var queryOutput = null;
	if(!skipInitialQuery) {
	console.log("Trying to run complete query.\n");
	var query = buildQuery(inputs, outputs, dirName);
	queryOutput = runQuery(query);
	}
//if it doesn't error, great!
	if(Boolean(queryOutput)) {
		console.log("Complete Query Successful\n");
		return sygProc.sygusToCode(queryOutput);
	}
//if it does, let's try running every constraint individually.
	else {	
		console.log("Complete Query Unsuccessful. Trying to break it down.\n");
		var arrayOfSols = new Array();
		var clonedArray;
		for(var i = 0; i > -1; i++) {
//TODO: !! remove
			if(!!buildQuery(inputs,outputs, dirName, i)) {
				arrayOfSols[i] = runQuery(buildQuery(inputs,outputs,dirName,i));
				console.log(arrayOfSols[i]);
				if(Boolean(arrayOfSols[i])) {
					console.log("Query #"+i.toString()+" successful.\n");
					arrayOfSols[i] = sygProc.sygusToCode(arrayOfSols[i]);
					arrayOfSols[i] = sygProc.repeatFinder(arrayOfSols[i]);
				}
				else {
					console.log("Query #"+i.toString()+" unsuccessful. Returning null.\n");
					return null;
				}

			//	console.log(arrayOfSols[i]);
				clonedArray = structuredClone(arrayOfSols);
		}
			else {
				break;
			}
		}
		console.log("All queries successful. Checking if solutions are identical.\n");
		if( sygProc.areSolsIdentical(arrayOfSols)) {
			console.log("Solutions are identical.\n");
			var newConstraints= sygProc.getLoopRep(arrayOfSols);
			//run the query using templace specified by the string, using all the constraints
			var loopCond = runQuery(buildQuery(inputs,newConstraints,dirName,-1,"2"));
			loopCond= sygProc.sygusToCode(loopCond);	
			//all of the solutions are identical except the loopcond, so we pick first one
			return sygProc.injectLoopCond(loopCond,clonedArray[0]);
		}
		console.log("Solutions are not identical. Returning null.\n");
		return null;
		
		
	}
}

function runQuery(queryString="", queryFilePath='./queries/query.sl') {
	if(queryString!=="") {
	fs.writeFileSync(queryFilePath, queryString, "utf8");
	}
	try{
		cvc4Output = execSync('doalarm () { perl -e \'alarm shift; exec @ARGV\' "$@"; }\n doalarm 4 cvc4 '+queryFilePath).toString();
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

//Takes a directory name and looks for queryTemplate.sl and constraints.sl. If constraintNumber>-1, it builds a query using just that constraint. templateNum is a string that will be appended to "queryTemplate" and it will use that file as a template for the sygus query
function buildQuery(inputs, outputs, dirName="./queries", constraintNumber=-1, templateNum="") {
var body = fs.readFileSync(dirName + "/queryTemplate"+templateNum+".sl","utf8");
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
