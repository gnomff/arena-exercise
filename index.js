'use strict';

/**
 * index.js is the entry point for node programs. Everything in this file will be executed
 * if we try to `require` it, so we need to keep it seperate.
 */


const arena = require('./arena');
const fs = require("fs");

const inputFileName = process.argv[2] || 'Artist_lists_small.txt'
const threshold = process.argv[3] || 50;
const outputFileName = process.argv[4] || 'output.csv'

arena.main(fs)(inputFileName, outputFileName, threshold)