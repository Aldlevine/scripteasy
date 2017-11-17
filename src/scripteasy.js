/**
 * The main scripteasy class. It serves as an entry point into scripteasy's
 * primary functionality.
 */
module.exports = class Scripteasy
{
  /**
   * Creates a new Scripteasy instance.
   * @param {object} scripts - A map of scripts keyed by name. Each top level
   * value is passed into the `Script` constructor as either the whole `opts`
   * object or as the `opts.try` value.
   */
  constructor (scripts)
  {
    /** @type {Array<Script>} */
    this.scripts = this.parseScripts(scripts);
  }

  /**
   * Parses the scripts for a new Scripteasy instance.
   * @param {object} scripts - A map of scripts.
   * @returns {Array<Script>} - The parsed scripts.
   */
  parseScripts (scripts)
  {
    const Script = require('./script');
    const result = {};
    for (let name in scripts) {
      const script = scripts[name];
      if (Object.is(script.constructor, Object)) {
        result[name] = new Script(this, script);
        continue;
      }

      result[name] = new Script(this, {try: script});
    }
    return result;
  }

  /**
   * Reads scripts from a file and generates a new Scripteasy instance using
   * those scripts.
   * @param {string} filename - The name of the file.
   * @returns {Scripteasy} - A new Scripteasy instance.
   */
  static fromFile (filename)
  {
    const fs = require('fs');
    const path = require('path');
    let scripts = {};

    if (['.yml', '.yaml'].indexOf(path.extname(filename)) > -1) {
      const yaml = require('yaml');
      const data = fs.readFileSync(filename).toString();
      scripts = yaml.eval(data);
    }
    else {
      scripts = require(path.resolve(process.cwd(), filename));
    }
    return new Scripteasy(scripts);
  }

  /**
   * Runs a script by name.
   * @param {string} name - The name of the script to run.
   * @return {Error?} - If an error occurs, the error is returned.
   */
  run (name)
  {
    return this.scripts[name].run();
  }
}
