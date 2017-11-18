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

    // this.env.PATH = path.resolve(this.cwd, 'node_modules', '.bin') + path.delimiter + this.env.PATH;
    this.env.PATH = Script._binPath(this.cwd, this.env.PATH);
  }

  /**
   * Runs the script.
   * @param {Array<string>} [args] - The args to pass into the command.
   * @return {Error?} - If an error occurs, the error is returned.
   */
  run (args)
  {
    return this._execTry(args);
  }

  /**
   * Executes a single command.
   * @param {string} command The command to execute.
   * @param {Array<string>} [args] - The args to pass into the command.
   * @return {Error?} - If an error occurs, the error is returned.
   */
  _exec (command, args)
  {
    if (command in this.st.scripts) {
      return this.st.run(command);
    }
    return Script.exec(command, args, this.cwd, this.env);
  }

  /**
   * Executes the script's try block. On error the catch block is invoked.
   * After everything (error or no) the finally block is invoked.
   * @param {Array<string>} [args] - The args to pass into the command.
   * @return {Error?} - If an error occurs, the error is returned.
   */
  _execTry (args)
  {
    let result = null;
    for (let command of this.try) {
      if (result = this._exec(command, args)) {
        this._execCatch(args);
        break;
      }
    }
    this._execFinally(args);
    return result;
  }

  /**
   * Executes the catch block.
   */
  _execCatch (args)
  {
    for (let command of this.catch) {
      if (this._exec(command, args)) return;
    }
  }

  /**
   * Executes the finally block.
   */
  _execFinally (args)
  {
    for (let command of this.finally) {
      if (this._exec(command, args)) return;
    }
  }

  /**
   * Executes a single command with the given args, cwd, and env
   * @param {string} command The command to execute.
   * @param {Array<string>} [args] - The args to pass into the command.
   * @param {string} [cwd = process.cwd()] - The current working directory.
   * @param {object} [env = process.env] - The environment variables to execute
   * the command with.
   * @return {Error?} - If an error occurs, the error is returned.
   */
  static exec (command, args, cwd = process.cwd(), env = process.env)
  {
    env = {...env};
    env.PATH = Script._binPath(cwd, env.PATH);

    if (args) {
      command = Script._interpolateArgs(command, args);
    }

    try {
      execSync(command, {
        cwd,
        env,
        stdio: [0,1,2],
      });
    }
    catch (err) {
      return err;
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

  /**
   * Replaces args placeholders with the arg values.
   * @param {string} command - The command to have the args replaced in.
   * @param {Array<string>} args - An array of args.
   * @returns {string} - The command after args have been interpolated.
   */
  static _interpolateArgs (command, args)
  {
    return command
      .replace(/\$@/g, args.join(' '))
      .replace(/\$\d+/g, (match) => {
        const idx = Number(match.replace(/\$/, ''));
        return args[idx] || '';
      });
  }

  /**
   * Adds the local node_modules/.bin to the current PATH env var.
   * @param {string} cwd - The current working directory where node_modules exists.
   * @param {string} PATH - The current PATH env var.
   * @returns {string} - The updated PATH env var.
   */
  static _binPath (cwd, PATH)
  {
    return path.resolve(cwd, 'node_modules', '.bin') + path.delimiter + PATH;
  }
}
