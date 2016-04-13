'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Encode and parse JavaScript data types including Map and Set
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @module json-next
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @type {Object}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// if(!_.isMap) _.isMap = (item) => _.isObject(item) && _.isFunction(item.get) && _.isFunction(item.set) && _.isFunction(item.entries);
// if(!_.isSet) _.isSet = (item) => _.isObject(item) && _.isFunction(item.has) && _.isFunction(item.add) && _.isFunction(item.entries);

var mapifySetifyByPath = function mapifySetifyByPath(data, pathArr) {

    var makeType = void 0;

    var pathStr = pathArr.reduce(function (str, _ref, i) {
        var _ref2 = _slicedToArray(_ref, 2);

        var type = _ref2[0];
        var key = _ref2[1];

        if (i < pathArr.length - 1) {

            if (type === 'm') {
                var mapArr = void 0;
                eval('mapArr = ' + str);
                var mapIdx = mapArr.findIndex(function (_ref3) {
                    var _ref4 = _slicedToArray(_ref3, 1);

                    var k = _ref4[0];
                    return k === key;
                });
                return str + '[' + mapIdx + '][1]';
            } else if (type === 'o') {
                return str + '[\'' + key + '\']';
            } else {
                return str + '[' + key + ']';
            }
        } else {
            makeType = type;
            return str;
        }
    }, 'data');

    if (makeType === 'm') {
        var makeMapStr = pathStr + ' = new Map(' + pathStr + ')';
        eval(makeMapStr);
    } else if (makeType === 's') {
        var makeSetStr = pathStr + ' = new Set(' + pathStr + ')';
        eval(makeSetStr);
    }

    return data;
};

/**
* Object with methods for encoding and parsing JavaScript data objects
*/
var JsonNext = {

    /**
    * Encode a JavaScript data object as JSON
    * @param {*} - The JavaScript data to be encoded
    * @param {Object} [options={pretty: false}] - An optional options object
    * @return {string} - Returns a JSON string
    */

    stringify: function stringify(data) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? { pretty: false } : arguments[1];


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

                return '[' + arr.map(function (_ref5) {
                    var _ref6 = _slicedToArray(_ref5, 2);

                    var key = _ref6[0];
                    var val = _ref6[1];
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
            return a.length < b.length;
        })) + ',"data":' + jsonStr + '}';

        if (options.pretty) {
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
                return a.length < b.length;
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