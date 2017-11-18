exports.Control = class Control
{
  constructor (type, commands)
  {
    this.type = type;
    if (typeof commands === 'string') {
      if (type == 'command') this.commands = commands;
      else this.commands = Control.fromObject(commands);
    }
    else {
      this.commands = Control.fromObject(commands);
    }
  }

  static fromObject (obj)
  {
    if (obj instanceof Array) {
      return obj.map(Control.fromObject).reduce((a, b) => a.concat(b), []);
    }
    if (typeof obj === 'string') {
      return [new exports.Command(obj)];
    }
    return Object.entries(obj).map((args) => new Control(...args));
  }
}

exports.Command = class Command extends String
{
  constructor (command)
  {
    super(command);
  }
}
