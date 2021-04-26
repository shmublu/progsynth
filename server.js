var http = require('http');
var execSync = require('child_process').execSync, cvc4Output;
var sygProc = require('./synth/sygusProcessing.js');
const fs = require('fs');
var synthesizer = require('./synth/query.js');


  var sy = synthesizer.sygusQuery(["\"six\"", "\"filt\"","\"sixth\"","\"o\""],["\"\"", "\"filt\"","\"sixth\"","\"\""], __dirname+'/queries');
  console.log(sy);
