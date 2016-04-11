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

var mapifySetifyByPath = function mapifySetifyByPath(data, pathArr) {

    var evalStr = 'data';
    pathArr.forEach(function (_ref, i) {
        var _ref2 = _slicedToArray(_ref, 2);

        var type = _ref2[0];
        var k = _ref2[1];

        console.log(evalStr);
        if (type === 'm') {
            if (i === pathArr.length - 1) {
                eval(evalStr + ' = new Map(' + evalStr + ')');
            } else {
                var innerObj = void 0;

                var getStr = evalStr + '.get(\'' + k + '\')';
                eval('innerObj = ' + getStr);

                var newObj = mapifySetifyByPath(innerObj, pathArr.slice(i + 1));

                var setStr = evalStr + '.set(\'' + k + '\', newObj)';
                eval(setStr);
            }
        } else if (type === 's') {
            if (i === pathArr.length - 1) {
                eval(evalStr + ' = new Set(' + evalStr + ')');
            } else {

                var setArr = void 0;
                var getSetArrStr = 'setArr = [...' + evalStr + ']';
                eval(getSetArrStr);

                setArr[k] = mapifySetifyByPath(setArr[k], pathArr.slice(i + 1));

                var toSetStr = evalStr + ' = new Set(setArr)';
                eval(toSetStr);
            }
        } else {
            evalStr = evalStr + ('[\'' + k + '\']');
            // dataObjToModify = dataObjToModify ? data[k] : dataObjToModify[k];
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

            var data = origData.data;
            var pathsArr = origData.json_next_paths.concat().sort(function (a, b) {
                return a.length > b.length;
            });

            // console.log('pathsArr is', JSON.stringify(origData.json_next_paths));

            return pathsArr.reduce(function (dataObj, pathArr) {
                return mapifySetifyByPath(dataObj, pathArr);
            }, data);
        } else {
            return origData;
        }
    }
};

exports.default = Object.create(JsonNext);