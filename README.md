# PROGSYNTH
Name TBD
## Description
Tool that utilizes cvc4 as a SYGUS solver to solve program-by-example problems. It utilizes a dual-layer approach tosolve each individual constraint in each benchmark by itself, and then compares if the solutions are the same. Aka, Programming by Example by using individual examples.

## Usage
Solves the query "query.sl" in this directory. The logic-type, function header, grammar, constraints, and check-synth must be separated by double newlines, as shown by "exampleQuery.sl" in ./queries . TODO: Better query recognition

## Problems
- Current version outputs AST

## Prerequisites:
- node.js
- cvc4
