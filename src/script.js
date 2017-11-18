const path = require('path');
const {execSync} = require('child_process');
const {Control, Command} = require('./control');

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

    const {cwd = process.cwd(), env = process.env, ...controls} = opts;

    env.PATH = Script._binPath(cwd, env.PATH);

    this.cwd = cwd;

    this.env = env;

    this.controls = Control.fromObject(controls);
  }

  /**
   * Runs the script.
   * @param {Array<string>} [args] - The args to pass into the command.
   * @return {Error?} - If an error occurs, the error is returned.
   */
  run (args)
  {
    const err = this._execControls(this.controls, args);
    if (err instanceof Error) return err;
  }

  _execControls (controls, args)
  {
    let err = false;
    let ctx = null;
    for (let control of controls) {
      if (control instanceof Command) {
        ctx = null;
        if (err = this._exec(control, args)) break;
        continue;
      }

      if (ctx == null && control.type === 'try') {
        ctx = 'try';
        err = this._execControls(control.commands, args);
        continue;
      }

      if (err && ctx === 'try' && control.type === 'catch') {
        ctx = 'catch';
        if (err = this._execControls(control.commands, args)) break;
        continue;
      }

      if ((ctx === 'try' || ctx === 'catch') && control.type === 'finally') {
        ctx = null;
        if (err = this._execControls(control.commands, args)) break;
        continue;
      }

      if (ctx == null && control.type === 'if') {
        ctx = 'if';
        err = this._execControls(control.commands, args);
        continue;
      }

      if (err && (ctx == 'if' || ctx == 'elif') && control.type === 'elif') {
        ctx = 'elif'
        err = this._execControls(control.commands, args);
        continue;
      }

      if (!err && (ctx === 'if' || ctx === 'elif') && control.type === 'then') {
        ctx = 'then';
        if (err = this._execControls(control.commands, args)) break;
        continue;
      }

      if (err && (ctx === 'if' || ctx === 'elif') && control.type === 'else') {
        ctx = null;
        if (err = this._execControls(control.commands, args)) break;
        continue;
      }
    }

    return err;
  }

  _execCommands (commands, args)
  {
    let err = false;
    for (let command of commands) {
      if (err = this._exec(command, args)) break;
    }
    return err;
  }

  /**
   * Executes a single command.
   * @param {string} command The command to execute.
   * @param {Array<string>} [args] - The args to pass into the command.
   * @return {Error?} - If an error occurs, the error is returned.
   */
  _exec (command, args)
  {
    command = command.toString();

    if (args) {
      command = Script._interpolateArgs(command, args);
    }

    command = Script._interpolateEnv(command, this.env);

    if (/^\(.+\)$/.test(command)) {
      const result = this._execEval(command);
      if (result instanceof Error) return result;
      else return !result;
    }


    if (command in this.st.scripts) {
      return this.st.run(command);
    }

    return Script.exec(command, args, this.cwd, this.env);
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

  _execEval (command)
  {
    const vm = require('vm');

    command = Script._interpolateSubshell(command);

    const context = vm.createContext({
      $: (cmd) => {
        return execSync(cmd, {
          cwd: this.cwd,
          env: this.env,
        }).toString();
      }
    });
    return vm.runInContext(command, context);
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
    return command.replace(/\$([a-zA-Z][a-zA-Z0-9_]*)/g, (_, p1) => env[p1]);
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

  static _interpolateSubshell (command)
  {
    return command.replace(/\$\(([^)]+)\)/g, (_, str) => `$(${JSON.stringify(str)})`);
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
