'use strict';

/**
 * index.js is the entry point for node programs. Everything in this file will be executed
 * if we try to `require` it, so we need to keep it seperate. This file is simply an entry point.
 * It provides the implementation of fs, and handles the parameters from the cli. We could
 * put the argument handling into `main` as well, but this is probably overkill.
 */


const arena = require('./arena');
const fs = require("fs");

const inputFileName = process.argv[2] || 'Artist_lists_small.txt'
const threshold = process.argv[3] || 50;
const outputFileName = process.argv[4] || 'output.csv'

arena.main(fs)(inputFileName, outputFileName, threshold)