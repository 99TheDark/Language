const fs = require("fs");

const operators = {
    "+": {
        id: "add",
        priority: 0
    },
    "-": {
        id: "sub",
        priority: 0
    },
    "*": {
        id: "mult",
        priority: 1
    },
    "/": {
        id: "div",
        priority: 1
    },
    "^": {
        id: "pow",
        priority: 2
    }
};

var parse = function(code) {
    let parenthesis = [];

    let depth = 0;
    let paren = null;

    let curOperator = null;

    for(let i = 0; i < code.length; i++) {
        let ch = code[i];
        if(Object.keys(operators).includes(ch)) {
            if(depth == 0 && (!curOperator || operators[ch].priority < operators[curOperator.type].priority)) {
                curOperator = {
                    type: ch,
                    idx: i
                };
            }
        } else if(ch == "(") {
            if(depth == 0) paren = i;
            depth++;
        } else if(ch == ")") {
            depth--;
            if(paren != null && depth == 0) {
                parenthesis.push(paren, i);
                paren = null;
            }
        } else {

        }
    }

    if(curOperator) {
        return {
            type: "operator",
            operation: operators[curOperator.type].id,
            left: parse(code.substring(0, curOperator.idx)),
            right: parse(code.substring(curOperator.idx + 1))
        };
    } else if(parenthesis.length) {
        return parse(code.substring(parenthesis[0] + 1, parenthesis[1]));
    } else {
        return {
            type: "literal",
            value: code.trim()
        }
    }

};

fs.readFile("test.txt", "utf8", (error, data) => {
    if(error) throw error;

    console.log(JSON.stringify(parse(data), null, "    "));
});