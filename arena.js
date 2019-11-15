'use strict';

const arena = module.exports;
const fp = require('lodash/fp');
const combinatorics = require('js-combinatorics');
const reduce = require('lodash/fp/reduce').convert({ 'cap': false });
const highland = require('highland');

/**
 * Increment the old value on collision
 * @param {string} key 
 * @param {integer} oldVal 
 * @param {integer} newVal 
 */
const incOnCollide = (key, oldVal, newVal) => oldVal + 1;

/**
 * upsert into a dicationary. calls onCollide when a key already exists, otherwise
 * inserts the new key/value
 * @param {object} map 
 * @param {string} key 
 * @param {*} val 
 * @param {(string, *, *) => *} onCollide 
 */
const upsert = (map, key, val, onCollide = incOnCollide) => {
  map[key]
    ? map[key] = onCollide(key, map[key], val)
    : map[key] = val;
  return map;
};

/**
 * dedupes and sorts a list
 */
const prepList = fp.compose(                       
  fp.sortBy(fp.identity),     //sort so that a,b is the same as b,a
  fp.uniq                     //unique to strip duplicates
);

/**
 * Generate the combination of all pairs: [a,b,c] => [[a,b], [a,c], [b,c]]
 * @param {[string]} list 
 */
const generateCombinations = (list) => combinatorics.combination(list, 2).toArray()

/**
 * @param {stream} stream a stream of strings
 * @param {integer} threshold min number before allowing output
 */
arena.main = (stream, threshold = 50) =>
  //stream of lines, like ['a,b,c', 'd,e,f', ...]
  stream
  //split each line, 'a,b,c' -> ['a','b','c']
  .map(fp.split(','))
  //remove any lines that don't have at least 2 items. We are looking for pairs, so < 2 makes no sense.
  .filter((line) => line.length > 1)
  //dedupe and sort the list. [c,b,a,c] -> [a,b,c]
  .map(prepList)
  //[a,b,c] => [[a,b], [a,c], [b,c]]
  .map(generateCombinations)
  //reduce the stream of lists of pairs into a single memoized object, incrementing each key by one per line
  //[[a,b], [a,c], [b,c]] -> {'a,b': 1, 'a,c': 1, 'b,c': 1}
  //[[a,b], [a,c]] -> {'a,b': 2, 'a,c': 2, 'b,c': 1}
  .reduce({}, (totalObj, pairs) => fp.reduce((lineObj, pair) => upsert(lineObj, fp.join(',', pair), 1), totalObj, pairs))
  //map the resulting dictionary to a list, stripping out any key/vals where the val < threshold
  .map(counts => reduce((result, v, k) => v >= threshold ? fp.concat(result, k) : result, [])(counts))
  //[[a],[b]] -> stream(a,b)
  .flatMap(highland)
  





