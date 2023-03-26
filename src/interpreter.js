const {findOperator} = require("./operator.js");
const {Variable} = require("./variable.js");

var variables;

var getValue = function(dat) {
    switch(dat.parsed) {
        case "operator":
            return parseExpression(dat);
        case "literal":
            return dat.value;
        case "variable":
            if(!Object.keys(variables).includes(dat.value)) throw `${dat.value} is not defined`;

            return variables[dat.value].value;
    }
};

var parseExpression = function(exp) {
    let [left, right] = [getValue(exp.left), getValue(exp.right)];

    return findOperator(exp.operation, exp.catagory).calculate(left, right);
};

var interpret = function(ast) {
    variables = {};

    ast.forEach(stat => {
        if(stat.parsed == "operator") {
            if(stat.catagory == "assignment") {
                let value = parseExpression(stat.right);
                variables[stat.left.name] = new Variable(value, "none");
            } else if(stat.operation == "print") {
                console.log(getValue(stat.value));
            }
        }
    });
};

module.exports = {
    interpret: interpret
};