# scripteasy

[![npm (scoped)](https://img.shields.io/npm/v/scripteasy.svg)](https://www.npmjs.com/package/scripteasy)
[![Docs Status](https://aldlevine.github.io/scripteasy/badge.svg)](https://aldlevine.github.io/scripteasy/source.html)

The easy script runner

## Where?

```
npm i scripteasy
```

## What?

scripteasy is an easy way to write and run npm scripts. Scripts can be housed in
the `package.json` or a separate JS/JSON or YAML file (and then specified in the
`package.json`).

## Why?

Sometimes a full blown task runner (Gulp, taskr, et al) is more than a project
calls for. While they can provide fast and powerful tools, the overhead and
dependency limitations can sometimes make them undesireable. Npm scripts can
serve as a quick and dirty, and (due to the power of shell scripting)
surpisingly capable tool. However, npm scripts can get ugly (linebreak much?),
they need special care to call themselves cross platform compatible
(particularly when dealing with env vars), and they have no simple approach to
manage control flow.

The goal of scripteasy is to bring the flexibility and portability of a fully
fledged task runner into the world of npm scripts and make scripting itself more
intuitive and, dare we say it, fun!

## How?

### Like JSON?

Then add your scripts directly to your `package.json`,

```json
{
  "scripteasy": {
    "build": [ "test", "docs" ],
    "precommit": {
      "try": [
        "git stash save --keep-index -q \"precommit stash\"",
        "build",
        "git add docs"
      ],
      "catch": "echo \"something went wrong!\"",
      "finally": [
        "git stash pop --index -q",
        "echo \"All done!\""
      ]
    },
    "test": "nyc mocha",
    "docs": "esdoc"
  }
}
```

or create a separate JSON file and reference it in your `package.json`.

```json
{
  "scripteasy": "scripts.json"
}
```

### Like JS?

Then create an external JS file,

```javascript
exports.build = [ 'test', 'docs' ];

exports.precommit = {
  try: [
    'git stash save --keep-index -q "precommit stash"',
    'build',
    'git add docs',
  ],
  catch: 'echo "something went wrong!"',
  finally: [
    'git stash pop --index -q',
    'echo "All done!"',
  ],
  test: 'nyc mocha',
  docs: 'esdoc',
}
```

and add **that** to your `package.json`.

```json
{
  "scripteasy": "scripts.js"
}
```

### Like YAML?

Then (I think you know where this is going) create an external YAML file

```yaml
build:
  - test
  - docs

precommit:
  try:
    - git stash save --keep-index -q "precommit stash"
    - build
    - git add docs
  catch: echo "something went wrong!"
  finally:
    - git stash pop --index -q
    - echo "All done!"

test: nyc mocha

docs: esdoc
```

> If it is possible to cut a word out, always cut it out.
> -- <cite>George Orwell</cite>

... yada yada yada, `package.json`

```json
{
  "scripteasy": "scripts.yml"
}
```

### Like actually running your scripts?

#### Try the CLI

```
ez build
```

```
ez test docs
```

#### Take a look at a hook

```json
{
  "scripts": {
    "precommit": "ez precommit"
  }
}
```

### Psst!

###### *Wanna know a secret?*

Specify your env vars as a property.

```json
{
  "scripteasy": {
    "sayyes": {
      "try": "echo \"$YES\"",
      "env": { "YES": "If you say so" }
    }
  }
}
```

```
$ ez sayyes
> If you say so
$ YES=no ez sayyes
> no
```

## Who?

You?

## When?

Why not now?

