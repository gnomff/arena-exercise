'use strict';

const {main} = require('./arena');
const highland = require('highland');

describe('Functional Tests', function() {

  test(`Given ['a,b,c']
        when main is run
        and threshold is 0
        then result is ['a,b', 'a,c', 'b,c']`, async function (){

    await main(highland(['a,b,c']), 0).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual(['a,b', 'a,c', 'b,c'])
    });
  });

  test(`Given ['a,b,c', 'a,b,c']
        when main is run
        and threshold is 1
        then result is ['a,b'], ['a,c'], ['b,c']`, async function (){

    await main(highland(['a,b,c', 'a,b,c']), 1).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual(['a,b', 'a,c', 'b,c'])
    });
  });

  test(`Given ['a,b,c', 'a,b,c']
        when main is run
        and threshold is 3
        then result is []`, async function (){

    await main(highland(['a,b,c', 'a,b,c']), 3).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual([])
    });
  });

  test(`Given ['a,b,c', 'd,e,f']
        when main is run
        and threshold is 2
        then result is []`, async function (){

    await main(highland(['a,b,c', 'd,e,f']), 2).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual([])
    });
  });

  test(`Given ['a,b,c', 'a,b,e']
        when main is run
        and threshold is 2
        then result is ['a,b']`, async function (){

    await main(highland(['a,b,c', 'a,b,e']), 2).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual(['a,b'])
    });
  });

  test(`Given ['a,b,c', 'a,b,e', 'a,c,e']
        when main is run
        and threshold is 2
        then result is ['a,b', 'a,c', 'a,e']`, async function (){

    await main(highland(['a,b,c', 'a,b,e', 'a,c,e']), 2).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual(['a,b', 'a,c', 'a,e'])
    });
  });
});