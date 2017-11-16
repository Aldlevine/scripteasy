module.exports = class Scripteasy
{
  constructor (scripts)
  {
    this.scripts = this.parseScripts(scripts);
  }

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
      scripts = require(filename);
    }
    return new Scripteasy(scripts);
  }

  run (name)
  {
    return this.scripts[name].run();
  }
}
