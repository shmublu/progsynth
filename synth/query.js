var execSync = require('child_process').execSync, cvc4Output;
fs = require('fs');
function runQuery(queryString="", queryFilePath='./queries/query.sl') {
	if(queryString!=="") {
	fs.writeFileSync(queryFilePath, queryString, "utf8");
	}
	try{
		cvc4Output = execSync('doalarm () { perl -e \'alarm shift; exec @ARGV\' "$@"; }\n doalarm 8 cvc4 '+queryFilePath).toString();
		return cvc4Output;
	}
	catch(error) {
	console.error(error);
	return "ERROR"
	}
}

//Takes a directory name and looks for queryTemplate.sl and constraints.sl. If constraintNumber>-1, it builds a query using just that constraint
function buildQuery(dirName="../queries", constraintNumber=-1) {
var body = fs.readFileSync(dirName + "/queryTemplate.sl","utf8");
body = body.split("#PART#\n");
var constraints = fs.readFileSync(dirName + "/constraints.sl","utf8"); 
if(constraintNumber < 0) {
	return body[0] + constraints + body[1];	
}
else {
	constraints = constraints.split("\n");
	return body[0] + constraints[constraintNumber] + body[1];
}

}
module.exports = {
  runQuery: runQuery,
  buildQuery: buildQuery
}
