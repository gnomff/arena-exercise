'use strict';

const arena = module.exports;
const fp = require('lodash/fp');
const combinatorics = require('js-combinatorics');
const reduce = require('lodash/fp/reduce').convert({ 'cap': false });
const highland = require('highland');

/**
 * upsert into a dictionary. increments by one when key already exists
 * @param {object} map 
 * @param {string} key 
 * @param {*} val 
 * @param {(string, *, *) => *} onCollide 
 */
const upsert = (map, key) => {
  map[key]
    ? map[key] = map[key] + 1
    : map[key] = 1;
  return map;
};

/**
 * Dedupes and sorts a list
 */
const prepList = fp.compose(      
  fp.sortBy(fp.identity),     //sort so that a,b is the same as b,a
  fp.uniq                     //unique to strip duplicates
);

/**
 * Makes an array of size count, filled with val
 * @param {*} val the thing to fill your array with
 * @param {integer} count the size of your array
 */
const makeArrayOf = (val, count) => fp.times(fp.constant(val), count)

/**
 * Takes a list of items and returns all the pairs of items in the list, like
 * [a,b,c] -> [[a,b], [a,c] [b,c]]
 * 
 * This function works by iterating through the list, zipping the tail of each 
 * iteration with the current value, like so:
 * [a, b, c] -> zip([a, a], [b, c]) -> [[a,b], [a, c]]
 * [b, c] -> zip([b], [c]) -> [[b,c]]
 * and then accumulating the results all together
 * 
 * @param {array} list the list of things you would like to have combinations of
 */
arena.combinations = (list) =>
  fp.reduce((totalResult, next) => {
    //get the tail of the previous - if the list is [a,b,c], the tail is [b,c]
    const restOfList = fp.tail(totalResult.prev);
    //return an object that holds the accumulation (result) and the next list to iterate over (prev)
    return {
      prev: restOfList,
      result: fp.concat(
        //zip the current value against the tail of the current list
        fp.zip(makeArrayOf(next, restOfList.length), restOfList), 
        totalResult.result
      )
    }
  }, 
  //start with this object
  {prev: list, result: []}, 
  //apply to list, and return just the result part
  list).result


/**
 * Take the final object, strip out any entries that have < threshold and 
 * return the resulting keys in a list
 * 
 * @param {integer} threshold any values under this threshold are removed
 * @param {object} result accumulator for 
 */
const finalizeResult = (threshold) => (result, value, key) => 
  value >= threshold 
    ? fp.concat(result, key) 
    : result

/**
 * 
 * @param {integer} threshold strip out pairs that have a count under this threshold
 * @param {stream} stream the stream of lines, like ['a,b,c', 'b,c,d', ...]
 */
arena.findCommonCombinations = (threshold) => (stream) => 
  stream
  //split each line, 'a,b,c' -> ['a','b','c']
  .map(fp.split(','))
  //remove any lines that don't have at least 2 items. We are looking for pairs, so < 2 makes no sense.
  .filter((line) => line.length > 1)
  //dedupe and sort the list. [c,b,a,c] -> [a,b,c]
  .map(prepList)
  //[a,b,c] => [[a,b], [a,c], [b,c]]
  .map(arena.combinations)
  //[[a,b], [a,c], [b,c]] => ['a,b', 'a,c', 'b,c']
  .map(fp.map(fp.join(',')))
  //reduce the stream of lists of pairs into a single memoized object, incrementing each key by one per line
  //[[a,b], [a,c], [b,c]] -> {'a,b': 1, 'a,c': 1, 'b,c': 1}
  //[[a,b], [a,c]] -> {'a,b': 2, 'a,c': 2, 'b,c': 1}
  .reduce({}, fp.reduce(upsert))
  //map the resulting dictionary to a list, stripping out any key/vals where the val < threshold
  .map(reduce(finalizeResult(threshold), []))
  //[[a],[b]] -> stream(a,b)
  .flatMap(highland)

/**
 * @param {fs} fs a handle to the filesystem. easier to mock if we pass it in
 * @param {string} inputFileName the name of the file to process
 * @param {string} outputFileName the name of the file to place the results
 * @param {integer} threshold the 
 */
arena.main = (fs) => (inputFileName, outputFileName, threshold) =>
  //we need a promise so that we can wait for completion. Node streams are async, so can't wait on them
  new Promise((resolve, reject) => {
    //create the output file stream
    const output = fs.createWriteStream(outputFileName)
    //attach callback handlers so that we can return once the output stream is finished writing (or errors)
    output.on('finish', () => resolve());
    output.on('error', (err) => reject(err));
    //read the input file as a stream
    highland(fs.createReadStream(inputFileName))
    //split into lines by \n
    .split()
    //break out the run method, this will make things easier to test
    .through(arena.findCommonCombinations(threshold))
    //put each pair onto its own line
    .map((x) => x + '\n')
    //write to the output file
    .pipe(output)
  })
  
  





