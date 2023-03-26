var Operator = class {
    constructor(...args) {
        this.calculate = args[0];
        this.catagory = args[1];
        this.name = args[2];
        this.full = `${this.catagory}-${this.name}`;
        if(typeof args[3] == "number") {
            this.priority = args[3];
            this.unary = args[4] ?? false;
            this.binary = args[5] ?? true;
        } else {
            this.priority = 0;
            this.unary = args[3] ?? false;
            this.binary = args[4] ?? true;
        }
    }
    fail(double) {
        switch(this.catagory) {
            case "bitwise":
            default:
                return double ?
                    "Binary operator used with one operand" :
                    "Unary operator used with two operands";
            case "assign":
                return double ?
                    "Cannot assign value with erroneous second operand" :
                    "Cannot assign value without a assignee and a value"
        }
    }
}

var noop = () => {};

var operators = {
    "+": new Operator((a, b) => a + b, "numerical", "add", 1),
    "-": new Operator((a, b) => a - b, "numerical", "subtract", 1, true),
    "*": new Operator((a, b) => a * b, "numerical", "multiply", 2),
    "/": new Operator((a, b) => a / b, "numerical", "divide", 2),
    "**": new Operator((a, b) => a ** b, "numerical", "exponent", 3),
    "%": new Operator((a, b) => a % b, "numerical", "modulos", 3),
    "&": new Operator((a, b) => a & b, "bitwise", "and", 3),
    "|": new Operator((a, b) => a | b, "bitwise", "or", 3),
    "^": new Operator((a, b) => a ^ b, "bitwise", "xor", 3),
    "~": new Operator(x => ~x, "bitwise", "not", 2, true, false),
    "~&": new Operator((a, b) => ~(a | b), "bitwise", "nand", 3),
    "~|": new Operator((a, b) => ~(a | b), "bitwise", "nor", 3),
    ">>": new Operator((a, b) => a >> b, "bitwise", "left-shift", 3),
    "<<": new Operator((a, b) => a << b, "bitwise", "right-shift", 3),
    ">>>": new Operator((a, b) => a >>> b, "bitwise", "unsigned-right-shift", 3),
    "&&": new Operator((a, b) => a && b, "boolean", "and", 3),
    "||": new Operator((a, b) => a || b, "boolean", "or", 3),
    "!": new Operator(x => !x, "boolean", "not", 3, true, false),
    "!&": new Operator((a, b) => !(a && b), "boolean", "nand", 3),
    "!|": new Operator((a, b) => !(a || b), "boolean", "nor", 3),
    "==": new Operator((a, b) => a == b, "boolean", "equals", 4),
    "!=": new Operator((a, b) => a != b, "boolean", "not-equals", 4),
    ">": new Operator((a, b) => a > b, "boolean", "greater", 3),
    "<": new Operator((a, b) => a < b, "boolean", "less", 3),
    ">=": new Operator((a, b) => a >= b, "boolean", "greater-equals", 3),
    "<=": new Operator((a, b) => a <= b, "boolean", "less-equals", 3),
    "=": new Operator(noop, "assignment", "assign"),
    "+=": new Operator(noop, "assignment", "add", false, true),
    "-=": new Operator(noop, "assignment", "subtract", false, true),
    "*=": new Operator(noop, "assignment", "multiply", false, true),
    "/=": new Operator(noop, "assignment", "divide", false, true),
    "**=": new Operator(noop, "assignment", "exponent", false, true),
    "&&=": new Operator(noop, "assignment", "and", false, true),
    "||=": new Operator(noop, "assignment", "or", false, true),
    "??=": new Operator(noop, "assignment", "nullish", false, true),
    "??": new Operator((a, b) => a ?? b, "generic", "nullish"),
    "print": new Operator(noop, "generic", "print", true, false)
};

var operatorChars = [];
while(true) {
    let arr = [];
    let layer_success = false;
    Object.keys(operators).forEach(op => {
        let ch = op[operatorChars.length];
        if(op.length > operatorChars.length && !arr.includes(ch)) {
            layer_success = true;
            arr.push(ch);
        }
    });
    if(!layer_success) break;
    operatorChars.push(arr);
};

var findOperator = function(operation, catagory) {
    for(let opKey in operators) {
        let op = operators[opKey];
        if(op.name == operation && op.catagory == catagory) return op;
    }

    return null;
};

module.exports = {
    Operator: Operator,
    operators: operators,
    operatorChars: operatorChars,
    findOperator: findOperator
};