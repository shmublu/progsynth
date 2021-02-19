var execSync = require('child_process').execSync, cvc4Output;
function runQuery(queryFile) {
cvc4Output = execSync('doalarm () { perl -e \'alarm shift; exec @ARGV\' "$@"; }\n doalarm 8 cvc4 '+queryFile).toString();
return cvc4Output;
}
module.exports = {
  runQuery: runQuery
}
