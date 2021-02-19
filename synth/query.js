var execSync = require('child_process').execSync, cvc4Output;
function runQuery(grammarFile, constraints) {
cvc4Output = execSync('doalarm () { perl -e \'alarm shift; exec @ARGV\' "$@"; }\n doalarm 8 cvc4 '+grammarFile).toString();
return cvc4Output;
}
module.exports = {
  runQuery: runQuery
}
