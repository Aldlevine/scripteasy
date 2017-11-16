const Script = require('./script');

module.exports = class Scriptease
{
  constructor (scripts)
  {
    this.scripts = this.parseScripts(scripts);
  }

  parseScripts (scripts)
  {
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

  run (name)
  {
    return this.scripts[name].run();
  }
}
