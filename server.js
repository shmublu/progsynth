var http = require('http');
var execSync = require('child_process').execSync, cvc4Output;
var sygProc = require('./synth/sygusProcessing.js');
const fs = require('fs');
var synthesizer = require('./synth/query.js');



http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
  var sy = (synthesizer.buildQuery(__dirname+'/queries'));
  var sy1 = (synthesizer.runQuery(sy));
  var sy2 = sygProc.sygusToCode(sy1);
  console.log(sy2);
  var sy3 = sygProc.repeatFinder(sy2);
  console.log(sy3);

 // console.log(sygProc.sygusToCode(sy));
  
	

}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
