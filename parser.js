"use strict";
exports.__esModule = true;
exports.parse = exports.traverse = exports.traverseStmt = exports.traverseExpr = exports.traverseArgs = void 0;
var lezer_python_1 = require("lezer-python");
var ast_1 = require("./ast");
var treeprinter_1 = require("./treeprinter");
// use the export keyword to make the function public
function traverseArgs(c, s) {
    var args = [];
    c.firstChild(); // go into arglist
    while (c.nextSibling()) {
        args.push(traverseExpr(c, s));
        c.nextSibling();
    }
    c.parent(); // pop arglist
    return args;
}
exports.traverseArgs = traverseArgs;
function traverseExpr(c, s) {
    switch (c.type.name) {
        case "Number":
            return {
                tag: "num",
                value: Number(s.substring(c.from, c.to))
            };
        case "VariableName":
            return {
                tag: "id",
                name: s.substring(c.from, c.to)
            };
        case "CallExpression":
            c.firstChild();
            var callName = s.substring(c.from, c.to);
            c.nextSibling(); // go to arglist
            var args = traverseArgs(c, s);
            if (args.length == 1) {
                if (callName !== "abs" && callName !== "print")
                    throw new Error("PARSE ERROR: unknown builtin1");
                c.parent(); // pop CallExpression
                return {
                    tag: "builtin1",
                    name: callName,
                    arg: args[0]
                };
            }
            else if (args.length == 2) {
                if (callName !== "max" && callName !== "min" && callName !== "pow")
                    throw new Error("PARSE ERROR: unknown builtin2");
                c.parent(); // pop CallExpression
                return {
                    tag: "builtin2",
                    name: callName,
                    arg1: args[0],
                    arg2: args[1]
                };
            }
            throw new Error("PARSE ERROR: function call with incorrect arity");
        case "UnaryExpression":
            c.firstChild(); // go into the unary expression
            var uniOp = s.substring(c.from, c.to);
            if (uniOp !== "-" && uniOp !== "+")
                throw new Error("PARSE ERROR: unsupported unary operator");
            c.nextSibling();
            var num = Number(uniOp + s.substring(c.from, c.to));
            if (isNaN(num))
                throw new Error("PARSE ERROR: unary operation failed");
            c.parent(); // pop the unary expression
            return { tag: "num", value: num };
        case "BinaryExpression":
            c.firstChild(); // go into the binary expression
            var left = traverseExpr(c, s);
            c.nextSibling(); // operator
            var op;
            switch (s.substring(c.from, c.to)) { // the range referred by the cursor
                case "+":
                    op = ast_1.BinOp.Plus;
                    break;
                case "-":
                    op = ast_1.BinOp.Minus;
                    break;
                case "*":
                    op = ast_1.BinOp.Mul;
                    break;
                default:
                    throw new Error("PARSE ERROR: unknown binary operator");
            }
            c.nextSibling();
            var right = traverseExpr(c, s);
            c.parent(); // pop the binary expression to traverse the next node
            return { tag: "binexpr", op: op, left: left, right: right }; // use "op" instead of "op : op" because the key and the value are the same.
        default:
            throw new Error("Could not parse expr at " + c.from + " " + c.to + ": " + s.substring(c.from, c.to));
    }
}
exports.traverseExpr = traverseExpr;
function traverseStmt(c, s) {
    switch (c.node.type.name) {
        case "AssignStatement":
            c.firstChild(); // go to name
            var name_1 = s.substring(c.from, c.to);
            c.nextSibling(); // go to equals
            c.nextSibling(); // go to value
            var value = traverseExpr(c, s);
            c.parent();
            return {
                tag: "define",
                name: name_1,
                value: value
            };
        case "ExpressionStatement":
            c.firstChild();
            var expr = traverseExpr(c, s);
            c.parent(); // pop going into stmt
            return { tag: "expr", expr: expr };
        default:
            if (c.node.from !== 0 || c.node.to !== 0) {
                throw new Error("Could not parse stmt at " + c.node.from + " " + c.node.to + ": " + s.substring(c.from, c.to));
            }
    }
}
exports.traverseStmt = traverseStmt;
// traverse the program (a list of statements)
function traverse(c, s) {
    switch (c.node.type.name) {
        case "Script":
            var stmts = [];
            c.firstChild();
            do { // traverse all statements
                stmts.push(traverseStmt(c, s));
            } while (c.nextSibling());
            console.log("traversed " + stmts.length + " statements ", stmts, "stopped at ", c.node);
            return stmts;
        default:
            throw new Error("Could not parse program at " + c.node.from + " " + c.node.to);
    }
}
exports.traverse = traverse;
// parse the code and traverse it
function parse(source) {
    var t = lezer_python_1.parser.parse(source); // parse the source code
    console.log("Parsed Source Code");
    console.log((0, treeprinter_1.stringifyTree)(t.cursor(), source, 0));
    console.log("\n");
    return traverse(t.cursor(), source);
}
exports.parse = parse;
