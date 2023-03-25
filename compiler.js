const fs = require("fs");

class Operator {
    constructor(...args) {
        this.id = args[0];
        if(typeof args[1] == "number") {
            this.priority = args[1];
            this.unary = args[2] ?? false;
            this.binary = args[3] ?? true;
        } else {
            this.priortiy = 2;
            this.unary = args[1] ?? false;
            this.binary = args[2] ?? true;
        }
    }
};

class DataType {
    constructor(name) {
        this.name = name;
    }
};

const datatypes = {
    "num": new DataType("number"),
    "bool": new DataType("boolean"),
    "str": new DataType("string"),
    "let": new DataType("any")
};

const operators = {
    "+": new Operator("add", 0),
    "-": new Operator("subtract", 0, true),
    "*": new Operator("multiply", 1),
    "/": new Operator("divide", 1),
    "**": new Operator("exponent"),
    "&": new Operator("bitwise-and"),
    "|": new Operator("bitwise-or"),
    "^": new Operator("bitwise-xor"),
    "&&": new Operator("and"),
    "||": new Operator("or"),
    "!": new Operator("not", true, false),
    "!&": new Operator("nand"),
    "!|": new Operator("nor"),
    "??": new Operator("nullish"),
    "=": new Operator("assign")
};

const operator_chars = [];
while(true) {
    let arr = [];
    let layer_success = false;
    Object.keys(operators).forEach(op => {
        let ch = op[operator_chars.length];
        if(op.length > operator_chars.length && !arr.includes(ch)) {
            layer_success = true;
            arr.push(ch);
        }
    });
    if(!layer_success) break;
    operator_chars.push(arr);
};

const keywords = Object.keys(datatypes); // to be concatenated with other constants

// Create Abstract Syntax Tree
var parse = function(code) {
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
            if(operator_chars[lookahead] && operator_chars[lookahead].includes(code[i + lookahead])) {
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
        } // No else yet
    }

    if(curOperator) {
        let left = parse(code.substring(0, curOperator.idx));
        let right = parse(code.substring(curOperator.idx + curOperator.length));
        let op = operators[curOperator.type];
        if(String(right.value).length == 0) {
            throw "Operator with no operand";
        } else if(String(left.value).length == 0) {
            if(!op.unary) throw "Binary operator used with one operand";

            return {
                parsed: "operator",
                operation: op.id,
                unary: true,
                value: right
            };
        } else {
            if(!op.binary) throw "Unary operator used with two operands";

            return {
                parsed: "operator",
                operation: op.id,
                unary: false,
                left: left,
                right: right
            };
        }
    } else if(parenthesis.length) {
        return parse(code.substring(parenthesis[0] + 1, parenthesis[1]));
    } else {
        let val = code.trim();
        let parts = val.split(" ");
        if(parts.length == 1) {
            if(keywords.includes(val)) throw "Invalid use of keyword";

            let num = Number(val);
            let bool = val == "true" ? true : val == "false" ? false : "";
        
            if(!isNaN(num) && val.length != 0) {
                return {
                    parsed: "literal",
                    type: "number",
                    value: num
                };
            } else if(bool) {
                return {
                    parsed: "literal",
                    type: "boolean",
                    value: bool
                };
            } else {
                return {
                    parsed: "literal",
                    type: "string",
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
                throw "Variable names cannot include spaces";
            }
        }
    }
};

fs.readFile("test.txt", "utf8", (error, data) => {
    if(error) throw error;

    let ast = JSON.stringify(parse(data), null, "    ");

    fs.writeFile("./ast.json", ast, err => {
        if(err) throw err;
    });
});
