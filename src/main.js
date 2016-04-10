const JsonNext = function() {

    this.stringify = (data) => {
        return JSON.stringify(data);
    }

    this.parse = (jsonStr) => {
        return JSON.parse(jsonStr);
    }

};

export default JsonNext;
