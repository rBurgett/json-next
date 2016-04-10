/* global describe, it */

import 'should';
import JsonNext from '../src/main';

const jsonNext = new JsonNext();

describe('JsonNext', function() {

    describe('stringify', function() {

        it('should take a JavaScript data object and return a JSON string', () => {
            jsonNext.stringify({name: 'Ryan', age: 30}).should.equal('{"name":"Ryan","age":30}');
        });

    });

    describe('parse', function() {

        it('should take a JSON string and return a JavaScript data object', () => {
            const data = jsonNext.parse('{"name":"Ryan","age":30}');
            data.should.be.Object();
            data.name.should.be.String();
            data.age.should.be.Number();
        });

    });

});
