Tool that utilizes cvc4 as a SYGUS solver to solve program-by-example problems. It utilizes a dual-layer approach tosolve each individual constraint in each benchmark by itself, and then compares if the solutions are the same.


Constraints are taken from the "constraints.txt" file are are separated by a newline. Each benchmark(composed of individual constraints) is separated by two newlines. The input-output pairs are separated by a colon, and strings are surrounded by double quotes.
For example:
"newyork":"newyork"
"rocks":"rocks"

12:24
36:72
0:0

"winner":3
"hi":1
"win":1

Two templates are required for the tool to work, found in the /queries folder: queryTemplate.sl and queryTemplate2.sl. The first contains the grammar for the function(s) we are attempting to synthesizers, and the second contains the grammar required to synthesize the loop condition(which must output an int).

Prerequisites:
- node.js
- cvc4
