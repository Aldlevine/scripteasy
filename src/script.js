const path = require('path');
const {execSync} = require('child_process');

module.exports = class Script
{
  constructor (st, opts = {})
  {
    this.st = st;
    this.try = [].concat(opts.try||[]);
    this.catch = [].concat(opts.catch||[]);
    this.finally = [].concat(opts.finally||[]);
    this.cwd = opts.cwd || process.cwd();
    this.env = {...opts.env, ...process.env};
    this.env.PATH = path.resolve(this.cwd, 'node_modules', '.bin') + path.delimiter + this.env.PATH;
  }

  run ()
  {
    return this._execTry();
  }

  _exec (command)
  {
    if (command in this.st.scripts) {
      const result = this.st.run(command);
      if (result) throw result;
      return;
    }
    command = Script._interpolateEnv(command, this.env);
    const stdout = execSync(command, {
      cwd: this.cwd,
      env: this.env,
      stdio: [0,1,2],
    });
  }

  _execTry ()
  {
    let result = null;
    for (let command of this.try) {
      try {
        this._exec(command);
      }
      catch (err) {
        this._execCatch();
        result = err;
        break;
      }
    }
    this._execFinally();
    return result;
  }

  _execCatch ()
  {
    for (let command of this.catch) {
      try {
        this._exec(command);
      }
      catch (err) {
        return;
      }
    }
  }

  _execFinally ()
  {
    for (let command of this.finally) {
      this._exec(command);
    }
  }

  static _interpolateEnv (command, env)
  {
    return command.replace(/\$([a-zA-Z][a-zA-Z0-9_]+)/g, (_, p1) => env[p1]);
  }
}
