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

module.exports = {
    error: error
};