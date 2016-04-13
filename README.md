# json-next

JsonNext is an npm package for encoding (as JSON) and parsing both current and next-generation JavaScript data objects including Maps and Sets.

### Installation
```
npm install json-next
```

### Dependencies
In order to use JsonNext, you must be in an environment which has Maps and Sets. Many browsers do not support those yet, so you will need to use something like [`babel-polyfill`](https://babeljs.io/docs/usage/polyfill/) to add those data types.

### Why?
First there was ES5, then ES6, then ES2015/16/17 or just ESNext. JavaScript is moving forward and we now have `Set` and `Map` data types. These are wonderful to use, but cannot be directly serialized as JSON. JsonNext gives you the same basic `stringify` and `parse` methods that you are used to using with JavaScript, but allows you to pass in data which includes Sets and Maps, nested as deeply as you want. Currently, if you pass a `Map` or `Set` into `JSON.stringify()`, they will be encoded as `{}` and all your data will be lost. You can write your own methods for converting your data into traditional data types if you would like, or you can just use jsonNext.

### How?
First, import/require the lib:
```
import jsonNext from 'json-next';
```
Or, if you are using the older syntax:
```
var jsonNext = require('json-next').default;
```
Take some data and encode it as JSON.
```
// get some data

const myObj = {
  someMap: new Map([ ['name', 'Ryan'], ['wife', 'Hannah'] ]),
  someSet: new Set([ 5325, 24324, 41243, 4, 525, 2, 54325, 432, 5 ]),
  mapOfSets: new Map([
    ['set1', new Set([ 'something', 'else', 'here' ])],
    ['set2', new Set([ new Map(), new Map(), new Map() ])]
  ]),
  num: 300,
  obj: {some: 'object'}
};

// stringify it

const jsonStr = jsonNext.stringify(myObj);

// if you want the JSON string to be formatted and pretty, pass in an object with pretty set to true

const prettyJson = jsonNext.stringify(myObj, {pretty: true});

```
When you want it back, just `parse` it.
```
const myNewObj = jsonNext.parse(jsonStr);

// your data is back, exactly the way it began

console.log(myNewObj);
```

### Limitations
1. Serialization - JsonNext can only handle values which can be serialized. This is less a limitation of JsonNext and more a fact of life. So, only Maps which use strings as keys can be encoded. Also, obviously, symbols cannot be encoded and neither can WeakMaps and WeakSets.
2. Recursion - JsonNext currently uses recursion in the `stringify` method. This allows you to quickly, deeply, and synchronously stringify all of your data (just like `JSON.stringify`). But, this also means there are limitations on how large your data sets can be. I plan to add an `async` flag to the options object which will allow you to encode asynchronously. It will be non-blocking and remove any limitations to data size.

### npm Scripts
Run the tests:
```
npm test
```
Re-compile the source code:
```
npm run build
```
Watch the `src` directory and automatically recompile on changes:
```
npm run watch
```

### Contributions
Contributions are welcome! If you have any issues and/or contributions you would like to make, feel free to file an issue and/or issue a pull reuqest.

### License
Apache License Version 2.0

Copyright (c) 2016 by Ryan Burgett.
