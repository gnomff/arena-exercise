'use strict';
const arena = require('./arena');
const highland = require('highland');
const fs = require("fs");

const inputFileName = process.argv[2] || 'Artist_lists_small.txt'
const threshold = process.argv[3] || 50;
const outputFileName = process.argv[4] || 'output.csv'

const output = fs.createWriteStream(outputFileName);

arena.main(highland(fs.createReadStream(inputFileName)).split(), threshold)
  .map((x) => x + '\n')
  .pipe(output)