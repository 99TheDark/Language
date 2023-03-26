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

const keywords = Object.keys(datatypes);

module.exports = {
    DataType: DataType,
    datatypes: datatypes,
    keywords: keywords
};