var execSync = require('child_process').execSync, cvc4Output;
var sygProc = require('./sygusProcessing.js');
var smt_parser = require('./parsers/smt_parser.js');
var astToJS = require('./parsers/astToJS.js');
fs = require('fs');
const v8 = require('v8');
const structuredClone = obj => {  return v8.deserialize(v8.serialize(obj));};

function sygusQuery(inputs, outputs, varNames,funcName,logicType, funcHeader,loopFuncHeader,funcGrammar,loopFuncGrammar,endOfQuery, dirName = "../queries", skipInitialQuery = 0) {
//first, try and run it with all the constraints.
	var queryOutput = null;
	if(!skipInitialQuery) {
	console.log("Trying to run complete query.\n");
	var query = buildQuery(inputs, outputs,funcName,logicType,funcHeader,funcGrammar,endOfQuery, dirName);
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
		var categoriesOfSols = new Array();
		var categoriesOfInputs = new Array();
		var updatedCategory = 0;
		var clonedArray;
		
		for(var i = 0; i > -1; i++) {
//TODO: !! remove
			var bq;
			if(!!(bq =buildQuery(inputs,outputs,funcName,logicType,funcHeader,funcGrammar,endOfQuery, dirName, i))) {
				arrayOfSols[i] = runQuery(bq);
				if(Boolean(arrayOfSols[i])) {
					console.log("Query #"+i.toString()+" successful.\n");
					arrayOfSols[i] = sygProc.sygusToCode(arrayOfSols[i]);
					arrayOfSols[i] = sygProc.repeatFinder(arrayOfSols[i]);
					var belongs = 0;
					if(hasRepitition(arrayOfSols[i])) {
						for(var j = 0; j < categoriesOfSols.length;j++) {
						//check if this solution fits into any category
						var testArray = [categoriesOfSols[j][0],arrayOfSols[i]];
							if( sygProc.areSolsIdentical(testArray)) {
								console.log("Query #" + i.toString()+" belongs to category ("+j.toString()+")");	
								belongs=1;
								updatedCategory=j;
								categoriesOfSols[j].push(arrayOfSols[i]);
								categoriesOfInputs[j].push(inputs[i]);
							}
						}
						if(!belongs) {
						//check if it has any repeats. If yes, put it in new category else throw it out
							var testArray = [arrayOfSols[i]];
							console.log("Query #" + i.toString()+" belongs to category ("+(categoriesOfSols.length).toString()+")");	
							categoriesOfSols.push(testArray);
							categoriesOfInputs.push([inputs[i]])
							updatedCategory=(categoriesOfSols.length)-1;
						} 				
						//Try and synthesize the loop condition using the newly updated category
						if(categoriesOfSols[updatedCategory].length>1) {
							var updatedCatCopy = structuredClone(categoriesOfSols[updatedCategory]);
							var newConstraints= sygProc.getLoopRept(updatedCatCopy);
							console.log(categoriesOfInputs);
							var loopCond = runQuery(buildQuery(categoriesOfInputs[updatedCategory],newConstraints,funcName,logicType,loopFuncHeader,loopFuncGrammar,endOfQuery,dirName,-1,"2"));
							if(loopCond) {
								loopCond= sygProc.sygusToCode(loopCond);
								//all of the solutions are identical except the loopcond, so splice first
								console.log(loopCond);
								var splicedSolution = sygProc.injectLoopCond(loopCond,structuredClone(categoriesOfSols[updatedCategory][0]))
								if(testOnConstraints(splicedSolution, inputs, outputs,varNames)) {
									return splicedSolution;
								}	
							}
						}
					}
				}
				else {
					//TODO: in v2, if we cannot find a solution we simply skip
					console.log("Query #"+i.toString()+" could not be synthesized.")
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
//this function returns if the solution has repitition(represented by a repeat node
//TODO: does not just check root node
function hasRepitition(arrayAST){
	return (arrayAST[0]==="repeat") ? true : false;
}
//Test the function on each constraint- return false if it fails 
function testOnConstraints(solution, inputs, outputs, varNames=['z']) {
	var solutionFunc =astToJS.astToJs(solution,varNames);
	for(var i =0; i < inputs.length; i++) {
		var testFunc = "testFunc("+commaInputs(inputs[i])+");\n"+ solutionFunc;
		var answer = eval(testFunc);
		//if answer is a string, have to put quotes around it
		if( typeof answer == "string") {
			answer = '\"' + answer + '\"';
		}
		console.log(outputs[i]);
		console.log(answer);
		if(!(answer==outputs[i])) {console.log("Constraint "+ i.toString() +" does not work."); return false;}
	}
	return true;
}

//Takes a string of inputs separated by spaces. Splits them and puts commas between. TODO: make this work so strings can have spaces
function commaInputs(totalInput) {
	var str = totalInput.split(' ');
	var inputs="";
	for(var i = 0; i < str.length; i++) {
		inputs+=str[i]+', '
	}
	return inputs;
}
function runQuery(queryString="", queryFilePath='./queries/query.sl') {
	if(queryString!=="") {
	fs.writeFileSync(queryFilePath, queryString, "utf8");
	}
	try{	
		console.time('label'+ queryString);
		cvc4Output = execSync('doalarm () { perl -e \'alarm shift; exec @ARGV\' "$@"; }\n doalarm 8 cvc4 '+queryFilePath).toString();
		console.timeEnd('label'+ queryString);
		return cvc4Output;
	}
	catch(error) {
	console.timeEnd('label'+ queryString);
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
function buildQuery(inputs, outputs,funcName,logicType,funcType,grammar,endQuery, dirName="./queries", constraintNumber=-1, templateNum="") {
var constraints = buildConstraints(inputs,outputs,funcName);
if(constraintNumber < 0) {
	return logicType+'\n' +funcType +'\n' + grammar + '\n' + constraints + '\n' + endQuery	
}
else {
	constraints = constraints.split("\n");
	if(constraints.length-1 > constraintNumber) {
		return logicType+'\n' +funcType +'\n' + grammar + '\n' + constraints[constraintNumber] + '\n' + endQuery	
		}
	else {
		return null;
	}
}
}
function buildQuery1(inputs, outputs,funcName, dirName="./queries", constraintNumber=-1, templateNum="") {
var body = fs.readFileSync(dirName + "/queryTemplate"+templateNum+".sl","utf8");
body = body.split("#PART#\n");
var constraints = buildConstraints(inputs,outputs,funcName);
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
