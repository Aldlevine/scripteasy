const path = require('path');
const minimist = require('minimist');
const ST = require('./scripteasy');
const argv = minimist(process.argv.slice(2));
const commands = argv._;
const {scripteasy} = require(path.join(process.cwd(), 'package.json'));
const st = new ST(scripteasy);

for (let command of commands) {
  const err = st.run(command);
  if (err) {
    console.error(`Error executing script '${command}' - "${err.message}"`);
    process.exit(err.status);
    break;
  }
}
