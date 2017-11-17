const path = require('path');
const {execSync} = require('child_process');

/**
 * A class that represents the commands, control flow, and context of a singe
 * script.
 */
module.exports = class Script
{
  /**
   * Creates a new Script instance.
   *
   * @param {Scripteasy} st - The parent Scripteasy instance.
   * @param {object} [opts = {}] - The script configuration options.
   * @param {Array<string> | string} [opts.try = []] - The main script commands.
   * @param {Array<string> | string} [opts.catch = []] - The catch block
   * commands that will run if the try block fails.
   * @param {Array<string> | string} [opts.finally = []] - The finally block
   * commands that will always run after the try/ctch blocks.
   * @param {string} [opts.cwd = process.cwd()] - The current working dir the
   * script should run in.
   * @param {object} [opts.env = {}] - The environment variables to pass in.
   * These will not override environment variables in the current context.
   */
  constructor (st, opts = {})
  {
    /** @type {Scripteasy} */
    this.st = st;

    /** @type {Array<string>} */
    this.try = [].concat(opts.try||[]);

    /** @type {Array<string>} */
    this.catch = [].concat(opts.catch||[]);

    /** @type {Array<string>} */
    this.finally = [].concat(opts.finally||[]);

    /** @type {string} */
    this.cwd = opts.cwd || process.cwd();

    /** @type {object} */
    this.env = {...opts.env, ...process.env};

    this.env.PATH = path.resolve(this.cwd, 'node_modules', '.bin') + path.delimiter + this.env.PATH;
  }

  /**
   * Runs the script.
   * @return {Error?} - If an error occurs, the error is returned.
   */
  run ()
  {
    return this._execTry();
  }

  /**
   * Executes a single command.
   * @param {string} command The command to execute.
   */
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

  /**
   * Executes the script's try block. On error the catch block is invoked.
   * After everything (error or no) the finally block is invoked.
   * @return {Error?} - If an error occurs, the error is returned.
   */
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

  /**
   * Executes the catch block.
   */
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

  /**
   * Executes the finally block.
   */
  _execFinally ()
  {
    for (let command of this.finally) {
      this._exec(command);
    }
  }

  /**
   * Replaces the environment variable invocations in a script, such as
   * `$MYVAR` with the value in the script's environment.
   * @param {string} command - The command to have the env vars replaced in.
   * @param {object} env - A map of the env vars to use.
   * @returns {string} - The command after env vars have been interpolated.
   */
  static _interpolateEnv (command, env)
  {
    return command.replace(/\$([a-zA-Z][a-zA-Z0-9_]+)/g, (_, p1) => env[p1]);
  }
}
