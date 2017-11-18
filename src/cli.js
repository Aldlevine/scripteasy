#!/usr/bin/env node

const path = require('path');
const ST = require('./scripteasy');

/** @type {Array<string>} */
const argv = process.argv.slice(2);

/** @type {number} */
const commandIdx = argv.findIndex((arg) => arg.charAt(0) !== '-');

/** @type {Array<string>} */
const easyArgv = commandIdx >= 0 ? argv.slice(0, commandIdx) : argv.slice();

/** @type {Array<string>} */
const commandsArgv = argv.slice(commandIdx);

/** @type {Array<Array<string>>} */
const commands = commandsArgv.join(' ')
  .split(' -- ')
  .filter(s => s.length)
  .map(s => s.trim().split(' '));

/** @type {object | string} */
const {scripteasy} = require(path.join(process.cwd(), 'package.json'));

let st;

/**
 * Show the help message and exit
 */
function help ()
{
  console.log(
//------------------------------------------------------------------------------
`scripteasy ${require('../package.json').version}

Usage:
--------
ez [opts] [[<script>] [args] [--]...]


Options:
--------
--help -h                 Show this message`
//------------------------------------------------------------------------------
  );
  process.exit(0);
}

if (easyArgv.length) {
  const minimist = require('minimist');
  const argv = minimist(easyArgv);
  if (argv.help || argv.h) help();
}

if (commands.length == 0) {
  help();
}

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
