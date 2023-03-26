const fs = require("fs");
const {parse} = require("./parser.js");
const {interpret} = require("./interpreter.js");

fs.readFile("program.txt", "utf8", (error, data) => {
    if(error) throw error;

    let ast = parse(data);
    let astString = JSON.stringify(ast, null, "    ");

    fs.writeFile("./ast.json", astString, err => {
        if(err) throw err;

        interpret(ast);
    });
});