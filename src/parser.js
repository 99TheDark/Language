const {error} = require("./error.js");
const {operators, operatorChars} = require("./operator.js");
const {datatypes, keywords} = require("./datatype.js");

// Create Abstract Syntax Tree
var parseStatement = function(code, full = code, offset = 0) {
    let parenthesis = [];

    let depth = 0;
    let paren = null;

    let curOperator = null;

    for(let i = 0; i < code.length; i++) {
        let ch = code[i];

        // Find full operator
        let full_read = "";
        let lookahead = 0;
        while(true) {
            let lookch = code[i + lookahead];
            if(operatorChars[lookahead] && operatorChars[lookahead].includes(code[i + lookahead])) {
                full_read += lookch;
            } else break;
            lookahead++;
        }
        if(full_read.length != 0 && depth == 0) {
            // Is an operator with highest priority
            if(!curOperator || operators[full_read].priority < operators[curOperator.type].priority) {
                curOperator = {
                    type: full_read,
                    idx: i,
                    length: full_read.length
                };
                i += curOperator.length - 1;
            }
        } else if(ch == "(") { // Parenthesis
            if(depth == 0) paren = i;
            depth++;
        } else if(ch == ")") {
            depth--;
            if(paren != null && depth == 0) {
                parenthesis.push(paren, i);
                paren = null;
            }
        }
    }

    if(curOperator) {
        let left = parseStatement(code.substring(0, curOperator.idx), full, offset);
        let right = parseStatement(code.substring(curOperator.idx + curOperator.length), full, offset + curOperator.idx + curOperator.length);
        let op = operators[curOperator.type];
        if(String(right.value).length == 0) {
            error("Operator with no operand", full, offset + curOperator.idx);
        } else if(String(left.value).length == 0) {
            if(!op.unary) error(op.fail(true), full, offset + curOperator.idx);

            return {
                parsed: "operator",
                operation: op.name,
                catagory: op.catagory,
                unary: true,
                value: right
            };
        } else {
            if(!op.binary) error(op.fail(false), full, offset + curOperator.idx);

            return {
                parsed: "operator",
                operation: op.name,
                catagory: op.catagory,
                unary: false,
                left: left,
                right: right
            };
        }
    } else if(parenthesis.length) {
        return parseStatement(code.substring(parenthesis[0] + 1, parenthesis[1]), full, offset + parenthesis[0]);
    } else {
        let diff = code.length - code.trimStart().length;
        let val = code.trim();
        let parts = val.split(" ");
        if(parts.length == 1) {
            if(keywords.includes(val)) error("Invalid use of keyword", full, offset + diff);

            let num = Number(val);
            let bool = val == "true" ? true : val == "false" ? false : "";

            if(!isNaN(num) && val.length != 0) {
                return {
                    parsed: "literal",
                    type: datatypes.num.name,
                    value: num
                };
            } else if(bool) {
                return {
                    parsed: "literal",
                    type: datatypes.bool.name,
                    value: bool
                };
            } else if(val[0] == "\"" && val[val.length - 1] == "\"") {
                return {
                    parsed: "literal",
                    type: datatypes.str.name,
                    value: val
                };
            } else {
                return {
                    parsed: "variable",
                    value: val
                };
            }
        } else if(Object.keys(datatypes).includes(parts[0])) {
            if(parts.length == 2) {
                return {
                    parsed: "variable",
                    datatype: datatypes[parts[0]].name,
                    name: parts[1]
                };
            } else {
                error("Variable names cannot include spaces", full, offset + diff + parts[0].length + 1);
            }
        } else {
            error("Invalid variable name or data type", full, offset + diff);
        }
    }
};

// Parse a bunch of statements
var parse = function(code) {
    let statements = code.split(";");
    statements.pop();

    return statements.map(statement => parseStatement(statement));
};

module.exports = {
    parse: parse
};