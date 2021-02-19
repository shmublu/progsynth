var http = require('http');
var execSync = require('child_process').execSync, cvc4Output;
const fs = require('fs');
var synthesizer = require('./synth/query.js');



http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
  var data;
	try{
		 data = fs.readFileSync('query.sl','utf8');
		}
	catch(err) {
	console.error(err);}
  console.log(data);
  console.log(synthesizer.runQuery(__dirname+'/queries/query.sl',null));
  
	

}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
