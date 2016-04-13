/* global describe, it */

import 'should';
import jsonNext from '../src/main';
// import fs from 'fs';

describe('JsonNext', function() {

    const myMap = new Map([['first', 'Benjamin'], ['last', 'Cisco']]);
    const mySecondMap = new Map([['first', 'Jake'], ['last', 'Cisco']]);
    myMap.set('second', mySecondMap);
    const mySet = new Set(['Benjamin', 'Jake']);
    const mySecondSet = new Set();
    mySecondSet.add('me');
    mySecondSet.add('you');
    mySet.add(mySecondSet);

    const myObj = {
        name: 'Benjamin',
        age: 37,
        map: myMap,
        set: mySet
    };

    describe('stringify', function() {

        it('should take a JavaScript data object and return a JSON string', () => {
            jsonNext.stringify({name: 'Benjamin', age: 37}).should.be.String();
        });

    });

    describe('parse', function() {

        const nestedDataObj = {
            something: ['one', 'two', 'three'],
            anything: {
                someMap: new Map([
                    [ 'some', new Map([ ['some', 'thing'] ]) ],
                    [ 'other', new Map([['some', new Set(['some', 'thing']) ]]) ],
                    [ 'thing', new Set(['any', 'thing', new Map([['some', new Set(['some', 'thing']) ]])]) ],
                    [ 'another', 'thing' ]
                ]),
                someSet: new Set( [new Set(['Benjamin', 'Jake']), new Set(['Miles', 'Molly'])] )
            },
            nums: [5435, 542543, 542, 54, 325, 42, 54, 325, 42],
            arr: [
                [543, 545, 54, 325, 4325, 432, 543, 254, 325, 34],
                [159, 154 ,891, 4891, 18593, 1852, 888],
                [543, 545, 54, 325, 4325, 432, 543, 254, 325, 34],
                {
                    something: 'here',
                    too: {here: ['is', 'an', {}]}
                }
            ]
        };

        it('should take a JSON string and return a JavaScript data object', () => {
            const jsonStr = jsonNext.stringify(myObj);
            const data = jsonNext.parse(jsonStr);
            data.should.be.Object();
            data.name.should.be.String();
            data.age.should.be.Number();
            data.map.get('last').should.be.String();
            data.map.get('second').get('first').should.be.String();
            data.set.has('Benjamin').should.be.True();
            [...[...data.set][2]][1].should.equal('you');
            const arrDataObj = ['Ryan', 'Hannah'];
            jsonNext.stringify(arrDataObj).should.equal(JSON.stringify({json_next_paths: [], data: arrDataObj}));
            const objDataObj = {name: 'Ryan'};
            jsonNext.stringify(objDataObj).should.equal(JSON.stringify({json_next_paths: [], data: objDataObj}));
            const dataStr = 'something';
            jsonNext.stringify(dataStr).should.equal(JSON.stringify({json_next_paths: [], data: dataStr}));
            const dataNum = 1000;
            jsonNext.stringify(dataNum).should.equal(JSON.stringify({json_next_paths: [], data: dataNum}));
            const jsonString = '["one", "two", "three"]';
            JSON.stringify(JSON.parse(jsonString)).should.equal(JSON.stringify(jsonNext.parse(jsonString)));
            const parentMap = new Map([ ['someKey', 'someValue'], ['anotherKey', 'anotherValue'] ]);
            const parentMapJson = jsonNext.stringify(parentMap);
            parentMapJson.should.equal(jsonNext.stringify(jsonNext.parse(parentMapJson)));
            const parentSet = new Set(['someValue', 'anotherValue']);
            const parentSetJson = jsonNext.stringify(parentSet);
            parentSetJson.should.equal(jsonNext.stringify(jsonNext.parse(parentSetJson)));

            jsonNext.stringify(nestedDataObj).should.equal(jsonNext.stringify(jsonNext.parse(jsonNext.stringify(nestedDataObj))));

            jsonNext.parse(jsonNext.stringify(nestedDataObj)).anything.someMap.get('thing').has('any').should.be.True();

        });

    });

});
