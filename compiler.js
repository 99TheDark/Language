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
    "var": new DataType("auto")
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
    "~": new Operator("bitwise-not", true, false),
    "~&": new Operator("bitwise-nand"),
    "~|": new Operator("bitwise-nor"),
    ">>": new Operator("bitwise-left-shift"),
    "<<": new Operator("bitwise-right-shift"),
    ">>>": new Operator("bitwise-unsigned-right-shift"),
    "&&": new Operator("and"),
    "||": new Operator("or"),
    "!": new Operator("not", true, false),
    "!&": new Operator("nand"),
    "!|": new Operator("nor"),
    "??": new Operator("nullish"),
    "%": new Operator("modulos"),
    "==": new Operator("equals"),
    "!=": new Operator("not-equals"),
    ">": new Operator("greater"),
    "<": new Operator("less"),
    ">=": new Operator("greater-equals"),
    "<=": new Operator("less-equals"),
    "=": new Operator("assign"),
    "print": new Operator("print", true, false)
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

var error = function(msg, full, idx) {
    let [row, col] = [0, 0];
    let lines = full.split("\n");
    let count = 0;
    lines.every((line, i) => {
        count += line.length;
        if(count > idx) {
            [row, col] = [i, line.length - count + idx];
            return false;
        }
        return true;
    });

    throw `${msg} (${row + 1}:${col})`;
};

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
        }
    }

    if(curOperator) {
        let left = parseStatement(code.substring(0, curOperator.idx), full, offset);
        let right = parseStatement(code.substring(curOperator.idx + curOperator.length), full, offset + curOperator.idx + curOperator.length);
        let op = operators[curOperator.type];
        if(String(right.value).length == 0) {
            error("Operator with no operand", full, offset + curOperator.idx);
        } else if(String(left.value).length == 0) {
            if(!op.unary) error("Binary operator used with one operand", full, offset + curOperator.idx);

            return {
                parsed: "operator",
                operation: op.id,
                unary: true,
                value: right
            };
        } else {
            if(!op.binary) error("Unary operator used with two operands", full, offset + curOperator.idx);

            return {
                parsed: "operator",
                operation: op.id,
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

fs.readFile("test.txt", "utf8", (error, data) => {
    if(error) throw error;

    let ast = JSON.stringify(parse(data), null, "    ");

    fs.writeFile("./ast.json", ast, err => {
        if(err) throw err;
    });
});
