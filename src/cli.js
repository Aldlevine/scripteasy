const path = require('path');
const minimist = require('minimist');
const ST = require('./scriptease');
const argv = minimist(process.argv.slice(2));
const commands = argv._;
const {scriptease} = require(path.join(process.cwd(), 'package.json'));
const st = new ST(scriptease);

for (let command of commands) {
  const err = st.run(command);
  if (err) {
    console.error(`Error executing script '${command}' - "${err.message}"`);
    process.exit(err.status);
    break;
  }
}
