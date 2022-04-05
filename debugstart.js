"use strict";
exports.__esModule = true;
var parser_1 = require("./parser");
// A call expression is an expression that calls a function.
// var ast = parse("abs(1)"); 
// Lezer parses the expression correctly. => 1 + (2 * 3).
// var ast = parse("1 + 2 * 3"); 
// var ast = parse("print(max(1, -1))");
// var ast = parse("print(x)");
var ast = (0, parser_1.parse)("");
console.log("ast");
console.log(JSON.stringify(ast, null, 2));
