var http = require('http');
var execSync = require('child_process').execSync, cvc4Output;
var sygProc = require('./synth/sygusProcessing.js');
const fs = require('fs');
var synthesizer = require('./synth/query.js');

var benchmarks = getBenchmarksFromFile("constraints.txt")
for(var i = 0; i< benchmarks.length; i=i+2) {
	console.time('label'+ i.toString());
	//change last number to 1 to ignore solution with all constraints at once TODO
	var sy = synthesizer.sygusQuery(benchmarks[i],benchmarks[i+1], __dirname+'/queries',0);
	console.timeEnd('label'+i.toString());
	console.log(sy);	
}
/*  var sy = synthesizer.sygusQuery(["\"six\"", "\"filt\"","\"sixth\"","\"o\""],["\"\"", "\"filt\"","\"sixth\"","\"\""], __dirname+'/queries');
  console.log(sy);
*/


function getBenchmarksFromFile(filePath) {
	var data = fs.readFileSync(filePath, "utf8", function(err, data) {
		if (err) {
			console.error(err);
			return null;}});
	data = data.substring(0, data.length - 1);
	var benchmarks = data.split('\n\n');
	var processedBenchmarks = [];
	for(var i = 0; i < benchmarks.length; i++) {
		var inputs = [];
		var outputs = [];	

		var benchmark = benchmarks[i].split('\n');
   		console.log(benchmark);
		for(var j= 0; j<benchmark.length; j++) {
			constraint = benchmark[j].split(':');
			inputs.push(constraint[0]);
			outputs.push(constraint[1]);
		}
		processedBenchmarks.push(inputs);
		processedBenchmarks.push(outputs);
	}
	return processedBenchmarks;
}
