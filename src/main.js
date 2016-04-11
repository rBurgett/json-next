/* eslint no-unused-vars:1 */

import 'babel-polyfill';
import _ from 'lodash';

const mapifySetifyByPath = (data, pathArr) => {

    let evalStr = 'data';
    pathArr.forEach(([ type, k ], i) => {

        if(type === 'm') {
            if(i === pathArr.length - 1) {
                eval(`${evalStr} = new Map(${evalStr})`);
            } else {
                let innerObj;

                const getStr = `${evalStr}.get('${k}')`;
                eval(`innerObj = ${getStr}`);

                const newObj = mapifySetifyByPath(innerObj, pathArr.slice(i + 1));

                const setStr = `${evalStr}.set('${k}', newObj)`;
                eval(setStr);

            }
        } else if(type === 's') {
            if(i === pathArr.length - 1) {
                eval(`${evalStr} = new Set(${evalStr})`);
            } else {

                let setArr;
                const getSetArrStr = `setArr = [...${evalStr}]`;
                eval(getSetArrStr);

                setArr[k] = mapifySetifyByPath(setArr[k], pathArr.slice(i + 1));

                const toSetStr = `${evalStr} = new Set(setArr)`;
                eval(toSetStr);

            }
        } else {
            evalStr = evalStr + `['${k}']`;
            // dataObjToModify = dataObjToModify ? data[k] : dataObjToModify[k];
        }
    });
    return data;
};

const JsonNext = {

    stringify(data, options = {async: false, pretty: false}) {

        // o, a, m, s

        let msArr = [];

        const recStringify = (item, pathArr = []) => {

            if(_.isArray(item)) {
                return '[' + item.map((d, i) => recStringify(d, pathArr.concat([ ['a', i] ]))).join(',') + ']';
            } else if(_.isPlainObject(item)) {
                return '{' + Object.keys(item).map(k => `"${k}":` + recStringify(item[k], pathArr.concat([ ['o', k] ]))).join(',') + '}';
            } else if(_.isMap(item)) {

                msArr = msArr.concat([pathArr.concat([ ['m', ''] ])]);

                item.forEach((val, key) => {
                    if(!_.isString(key)) throw new Error('A Map can only be encoded as JSON if all keys are strings');
                });

                const arr = [...item];

                return '[' + arr.map(([ key, val ]) => `["${key}",${recStringify(val, pathArr.concat([ ['m', key] ]))}]`).join(',') + ']';

            } else if(_.isSet(item)) {

                msArr = msArr.concat([pathArr.concat([ ['s', ''] ])]);

                const arr = [...item];

                return '[' + arr.map((d, i) => recStringify(d, pathArr.concat([ ['s', i] ]))).join(',') + ']';

            } else {
                return JSON.stringify(item);
            }
        };

        const jsonStr = recStringify(data);
        const finalJsonStr = `{"json_next_paths":${JSON.stringify(msArr.sort((a, b) => a.length > b.length))},"data":${jsonStr}}`;

        if(options.pretty) {
            return JSON.stringify(JSON.parse(finalJsonStr), null, '  ');
        } else {
            return finalJsonStr;
        }
    },

    parse(jsonStr) {

        let origData;
        try {
            origData = JSON.parse(jsonStr);
        } catch(e) {
            throw new Error(e);
        }

        if(_.isPlainObject(origData) && _.isArray(origData.json_next_paths)) {

            const data = origData.data;
            const pathsArr = origData.json_next_paths.concat().sort((a, b) => a.length > b.length);

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
