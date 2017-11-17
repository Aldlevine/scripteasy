#!/usr/bin/env node

const path = require('path');
// const minimist = require('minimist');
const ST = require('./scripteasy');

/** @type {Array<string>} */
const argv = process.argv.slice(2);

/** @type {Array<Array<string>>} */
const commands = argv.join(' ').split(' -- ').map(s => s.trim().split(' '));

/** @type {object | string} */
const {scripteasy} = require(path.join(process.cwd(), 'package.json'));

let st;

if (typeof scripteasy === 'string') {
  st = ST.fromFile(scripteasy);
}
else {
  st = new ST(scripteasy);
}

for (let command of commands) {
  const args = command.slice(1);
  const err = st.run(command[0], args);
  if (err) {
    console.error(`Error executing script '${command}' - "${err.message}"`);
    process.exit(err.status);
    break;
  }
}
