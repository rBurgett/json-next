/**
* Encode and parse JavaScript data types including Map and Set
* @module json-next
* @type {Object}
*/

const isArray = (item) => (typeof item === 'object') && (Array.isArray(item) === true);
const isPlainObject = (item) => (typeof item === 'object') && (Array.isArray(item) === false) && !item.entries;
const isMap = (item) => (typeof item === 'object') && (Array.isArray(item) === false) && (typeof item.entries === 'function') && (typeof item.get === 'function') && (typeof item.set === 'function');
const isSet = (item) => (typeof item === 'object') && (Array.isArray(item) === false) && (typeof item.entries === 'function') && (typeof item.add === 'function');
const isString = (item) => typeof item === 'string';

const mapifySetifyByPath = (data, pathArr) => {

    let makeType;

    let pathStr = pathArr.reduce((str, [ type, key ], i) => {
        if(i < pathArr.length - 1) {

            if(type === 'm') {
                let mapArr;
                eval(`mapArr = ${str}`);
                const mapIdx = mapArr.findIndex(([ k ]) => k === key);
                return `${str}[${mapIdx}][1]`;
            } else if(type === 'o'){
                return `${str}['${key}']`;
            } else {
                return `${str}[${key}]`;
            }

        } else {
            makeType = type;
            return str;
        }
    }, 'data');

    if(makeType === 'm') {
        let makeMapStr = `${pathStr} = new Map(${pathStr})`;
        eval(makeMapStr);
    } else if(makeType === 's') {
        let makeSetStr = `${pathStr} = new Set(${pathStr})`;
        eval(makeSetStr);
    }

    return data;
};

/**
* Object with methods for encoding and parsing JavaScript data objects
*/
const JsonNext = {

    /**
    * Encode a JavaScript data object as JSON
    * @param {*} - The JavaScript data to be encoded
    * @param {Object} [options={pretty: false}] - An optional options object
    * @return {string} - Returns a JSON string
    */
    stringify(data, options = {pretty: false}) {

        let msArr = [];

        const recStringify = (item, pathArr = []) => {

            if(isArray(item)) {
                return '[' + item.map((d, i) => recStringify(d, pathArr.concat([ ['a', i] ]))).join(',') + ']';
            } else if(isPlainObject(item)) {
                return '{' + Object.keys(item).map(k => `"${k}":` + recStringify(item[k], pathArr.concat([ ['o', k] ]))).join(',') + '}';
            } else if(isMap(item)) {

                msArr = msArr.concat([pathArr.concat([ ['m', ''] ])]);

                item.forEach((val, key) => {
                    if(!isString(key)) throw new Error('A Map can only be encoded as JSON if all keys are strings');
                });

                const arr = [...item];

                return '[' + arr.map(([ key, val ]) => `["${key}",${recStringify(val, pathArr.concat([ ['m', key] ]))}]`).join(',') + ']';

            } else if(isSet(item)) {

                msArr = msArr.concat([pathArr.concat([ ['s', ''] ])]);

                const arr = [...item];

                return '[' + arr.map((d, i) => recStringify(d, pathArr.concat([ ['s', i] ]))).join(',') + ']';

            } else {
                return JSON.stringify(item);
            }
        };

        const jsonStr = recStringify(data);
        const finalJsonStr = `{"json_next_paths":${JSON.stringify(msArr.sort((a, b) => a.length < b.length))},"data":${jsonStr}}`;

        if(options.pretty) {
            return JSON.stringify(JSON.parse(finalJsonStr), null, '  ');
        } else {
            return finalJsonStr;
        }
    },

    /**
    * Parse a JSON string
    * @param {string} - The JSON string to be parsed
    * @return {*} - Returns the parsed data
    */
    parse(jsonStr) {

        let origData;
        try {
            origData = JSON.parse(jsonStr);
        } catch(e) {
            throw new Error(e);
        }

        if(isPlainObject(origData) && isArray(origData.json_next_paths)) {

            const data = origData.data;
            const pathsArr = origData.json_next_paths.concat().sort((a, b) => a.length < b.length);

            return pathsArr
                .reduce((dataObj, pathArr) => {
                    return mapifySetifyByPath(dataObj, pathArr);
                }, data);

        } else {
            return origData;
        }
    }

};

export default Object.create(JsonNext);
