console.log(getFuncName("(synth-fun f ((name String)(test String)) String"));
console.log(getNameAndVars("(synth-fun f ((name String)(test String)) String"));
console.log(changeReturnToInt("(synth-fun f ((name String)(test String)) String"));
console.log(parseConstraints('f', "(constraint (= (f \"Nancy FreeHafer\") 2))\n(constraint (= (f \"Andrew Cencici\") 3))\n(constraint (= (f \"Jan Kotas\") 4))"))
//Parses a SyGuS query by double newlines
function parseQuery(query) {
	var parts = query.split("\n\n");
	var logicType = parts[0]
	var funcType = parts[1]
	var grammar = parts[2]
	var constraints = parts[3]
	var endQuery = parts[4]
	return parseConstraints(constraints);
}

//Returns [funcName,[input_1,input_2,...input_n]]
function getNameAndVars(funcType) {
	var parenCounter=0;
	var foundSpace = 0;
	var arrayOfInputs = new Array();
	var func = funcType.trim();
	for(var i = 0; i < func.length; i++) {
		if(func.charAt(i)=='(') {parenCounter++;
			if(parenCounter==3) {
				arrayOfInputs.push("");
				foundSpace=0;
			}
		}
		else if(func.charAt(i)==')') {parenCounter--;}
		else if(func.charAt(i)==' ') {foundSpace=1;}
		if(func.charAt(i)!='(' &&parenCounter==3&&foundSpace==0) { arrayOfInputs[arrayOfInputs.length-1]+= func.charAt(i); }
	}
	return arrayOfInputs;

}

//Returns SyGuS function header except return type is changed to int
function changeReturnToInt(funcType) {
	var func = funcType.trim();	
	for(var i = func.length -1; i > 0; i--) {
		if(func.charAt(i)==' ') {	
			return func.substring(0,i) + " Int";
		}
	}	
	return null;
}

//Returns function name
function getFuncName(funcType) {
	var func = funcType.trim();
	func = func.split("(synth-fun ");
	for(var i =0; i  < func[1].length ; i++) {
		if(func[1].charAt(i)==' ') {	
			return func[1].substring(0,i);
		}
	}	
	return null;
	
}

//Takes constraints from parseQuery and returns an array [[inputs],[outputs]]
function parseConstraints(funName, constraints) {
	var list = constraints.split('\n');
	var inputs = new Array();
	var outputs = new Array();
	for(var i =0; i < list.length; i++) {
		var parts = list[i].split(funName+" ");
		var index = 0;
		var inputVal=""
		for(var j = 0; j < parts[1].length; j++) {
			if(parts[1].charAt(j)==')') {
				index = j;
				inputs.push(inputVal);
				break;
			}
			inputVal+=parts[1].charAt(j);
		}
		var newSearch = (parts[1].substring(index+1, parts[1].length)).trim();
		var outputVal="";
		for(var j = 0; j < newSearch.length; j++) {
			if(newSearch.charAt(j)==')') {
				outputs.push(outputVal);
				break;
			}
			outputVal+=newSearch.charAt(j);
		}
	
	}
	return [inputs,outputs];		

}

module.exports = {
parseQuery:parseQuery
}

