'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /* eslint no-unused-vars:1 */

require('babel-polyfill');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

if (!_lodash2.default.isMap) _lodash2.default.isMap = function (item) {
    return _lodash2.default.isObject(item) && _lodash2.default.isFunction(item.get) && _lodash2.default.isFunction(item.set) && _lodash2.default.isFunction(item.entries);
};
if (!_lodash2.default.isSet) _lodash2.default.isSet = function (item) {
    return _lodash2.default.isObject(item) && _lodash2.default.isFunction(item.has) && _lodash2.default.isFunction(item.add) && _lodash2.default.isFunction(item.entries);
};

var mapifySetifyByPath = function mapifySetifyByPath(data, pathArr) {

    var evalStr = 'data';
    var skip = false;
    pathArr.forEach(function (_ref, i) {
        var _ref2 = _slicedToArray(_ref, 2);

        var type = _ref2[0];
        var k = _ref2[1];


        if (type === 'm') {
            if (i === pathArr.length - 1) {
                var newMapStr = evalStr + ' = new Map(' + evalStr + ')';
                if (!skip) eval(newMapStr);
                skip = false;
            } else {
                var innerObj = void 0;

                var getStr = evalStr + '.get(\'' + k + '\')';
                eval('innerObj = ' + getStr);

                var newObj = mapifySetifyByPath(innerObj, pathArr.slice(i + 1));
                skip = true;

                var setStr = evalStr + '.set(\'' + k + '\', newObj)';
                eval(setStr);
            }
        } else if (type === 's') {
            if (i === pathArr.length - 1) {

                var newSetStr = evalStr + ' = new Set(' + evalStr + ')';

                if (!skip) eval(newSetStr);

                skip = false;
            } else {

                var setArr = [];
                var setEntries = eval(evalStr + '.values()');
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = setEntries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var val = _step.value;

                        setArr = setArr.concat([val]);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                setArr[k] = mapifySetifyByPath(setArr[k], pathArr.slice(i + 1));
                skip = true;

                var toSetStr = evalStr + ' = new Set(setArr)';
                eval(toSetStr);
            }
        } else {
            evalStr = evalStr + ('[\'' + k + '\']');
        }
    });
    return data;
};

var JsonNext = {
    stringify: function stringify(data) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? { async: false, pretty: false } : arguments[1];


        // o, a, m, s

        var msArr = [];

        var recStringify = function recStringify(item) {
            var pathArr = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];


            if (_lodash2.default.isArray(item)) {
                return '[' + item.map(function (d, i) {
                    return recStringify(d, pathArr.concat([['a', i]]));
                }).join(',') + ']';
            } else if (_lodash2.default.isPlainObject(item)) {
                return '{' + Object.keys(item).map(function (k) {
                    return '"' + k + '":' + recStringify(item[k], pathArr.concat([['o', k]]));
                }).join(',') + '}';
            } else if (_lodash2.default.isMap(item)) {

                msArr = msArr.concat([pathArr.concat([['m', '']])]);

                item.forEach(function (val, key) {
                    if (!_lodash2.default.isString(key)) throw new Error('A Map can only be encoded as JSON if all keys are strings');
                });

                var arr = [].concat(_toConsumableArray(item));

                return '[' + arr.map(function (_ref3) {
                    var _ref4 = _slicedToArray(_ref3, 2);

                    var key = _ref4[0];
                    var val = _ref4[1];
                    return '["' + key + '",' + recStringify(val, pathArr.concat([['m', key]])) + ']';
                }).join(',') + ']';
            } else if (_lodash2.default.isSet(item)) {

                msArr = msArr.concat([pathArr.concat([['s', '']])]);

                var _arr = [].concat(_toConsumableArray(item));

                return '[' + _arr.map(function (d, i) {
                    return recStringify(d, pathArr.concat([['s', i]]));
                }).join(',') + ']';
            } else {
                return JSON.stringify(item);
            }
        };

        var jsonStr = recStringify(data);
        var finalJsonStr = '{"json_next_paths":' + JSON.stringify(msArr.sort(function (a, b) {
            return a.length > b.length;
        })) + ',"data":' + jsonStr + '}';

        if (options.pretty) {
            return JSON.stringify(JSON.parse(finalJsonStr), null, '  ');
        } else {
            return finalJsonStr;
        }
    },
    parse: function parse(jsonStr) {

        var origData = void 0;
        try {
            origData = JSON.parse(jsonStr);
        } catch (e) {
            throw new Error(e);
        }

        if (_lodash2.default.isPlainObject(origData) && _lodash2.default.isArray(origData.json_next_paths)) {

            var data = _lodash2.default.isPlainObject(origData.data) ? Object.assign({}, origData.data) : _lodash2.default.isArray(origData.data) ? [].concat(origData.data) : origData.data;
            var pathsArr = origData.json_next_paths.concat().sort(function (a, b) {
                return a.length > b.length;
            });

            return pathsArr.reduce(function (dataObj, pathArr) {
                return mapifySetifyByPath(dataObj, pathArr);
            }, data);
        } else {
            return origData;
        }
    }
};

exports.default = Object.create(JsonNext);

// import 'babel-polyfill';
// import _ from 'lodash';
//
// const mapifySetifyByPath = (data, pathArr) => {
//
//     let evalStr = 'data';
//     pathArr.forEach(([ type, k ], i) => {
//
//         if(type === 'm') {
//             if(i === pathArr.length - 1) {
//                 eval(`${evalStr} = new Map(${evalStr})`);
//             } else {
//                 let innerObj;
//
//                 const getStr = `${evalStr}.get('${k}')`;
//                 eval(`innerObj = ${getStr}`);
//
//                 const newObj = mapifySetifyByPath(innerObj, pathArr.slice(i + 1));
//
//                 const setStr = `${evalStr}.set('${k}', newObj)`;
//                 eval(setStr);
//
//             }
//         } else if(type === 's') {
//             if(i === pathArr.length - 1) {
//                 eval(`${evalStr} = new Set(${evalStr})`);
//             } else {
//
//                 let setArr;
//                 const getSetArrStr = `setArr = [...${evalStr}]`;
//                 eval(getSetArrStr);
//
//                 setArr[k] = mapifySetifyByPath(setArr[k], pathArr.slice(i + 1));
//
//                 const toSetStr = `${evalStr} = new Set(setArr)`;
//                 eval(toSetStr);
//
//             }
//         } else {
//             evalStr = evalStr + `['${k}']`;
//             // dataObjToModify = dataObjToModify ? data[k] : dataObjToModify[k];
//         }
//     });
//     return data;
// };
//
// const JsonNext = {
//
//     stringify(data, options = {async: false, pretty: false}) {
//
//         // o, a, m, s
//
//         let msArr = [];
//
//         const recStringify = (item, pathArr = []) => {
//
//             if(_.isArray(item)) {
//                 return '[' + item.map((d, i) => recStringify(d, pathArr.concat([ ['a', i] ]))).join(',') + ']';
//             } else if(_.isPlainObject(item)) {
//                 return '{' + Object.keys(item).map(k => `"${k}":` + recStringify(item[k], pathArr.concat([ ['o', k] ]))).join(',') + '}';
//             } else if(_.isMap(item)) {
//
//                 msArr = msArr.concat([pathArr.concat([ ['m', ''] ])]);
//
//                 item.forEach((val, key) => {
//                     if(!_.isString(key)) throw new Error('A Map can only be encoded as JSON if all keys are strings');
//                 });
//
//                 const arr = [...item];
//
//                 return '[' + arr.map(([ key, val ]) => `["${key}",${recStringify(val, pathArr.concat([ ['m', key] ]))}]`).join(',') + ']';
//
//             } else if(_.isSet(item)) {
//
//                 msArr = msArr.concat([pathArr.concat([ ['s', ''] ])]);
//
//                 const arr = [...item];
//
//                 return '[' + arr.map((d, i) => recStringify(d, pathArr.concat([ ['s', i] ]))).join(',') + ']';
//
//             } else {
//                 return JSON.stringify(item);
//             }
//         };
//
//         const jsonStr = recStringify(data);
//         const finalJsonStr = `{"json_next_paths":${JSON.stringify(msArr.sort((a, b) => a.length > b.length))},"data":${jsonStr}}`;
//
//         if(options.pretty) {
//             return JSON.stringify(JSON.parse(finalJsonStr), null, '  ');
//         } else {
//             return finalJsonStr;
//         }
//     },
//
//     parse(jsonStr) {
//
//         let origData;
//         try {
//             origData = JSON.parse(jsonStr);
//         } catch(e) {
//             throw new Error(e);
//         }
//
//         if(_.isPlainObject(origData) && _.isArray(origData.json_next_paths)) {
//
//             const data = origData.data;
//             const pathsArr = origData.json_next_paths.concat().sort((a, b) => a.length > b.length);
//
//             return pathsArr
//                 .reduce((dataObj, pathArr) => {
//                     return mapifySetifyByPath(dataObj, pathArr);
//                 }, data);
//
//         } else {
//             return origData;
//         }
//     }
//
// };
//
// export default Object.create(JsonNext);