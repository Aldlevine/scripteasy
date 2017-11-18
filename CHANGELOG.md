<a name="0.1.0-0"></a>
# [0.1.0-0](https://github.com/Aldlevine/scripteasy/compare/v0.0.5...v0.1.0-0) (2017-11-18)


### Features

* Add ability to pass args into scripts ([d87dd19](https://github.com/Aldlevine/scripteasy/commit/d87dd19))
* **cli:** Add option parsing and `--help` option ([2029ae0](https://github.com/Aldlevine/scripteasy/commit/2029ae0))
* **scripteasy:** Add ability to execute shell commands directly ([45e0ba9](https://github.com/Aldlevine/scripteasy/commit/45e0ba9))


### BREAKING CHANGES

* When running multiple scripts in one CLI command, each script must now be separated
by `--`. As an example `ez cmd1 cmd2 ...` should become `ez cmd1 -- cmd2 -- ...`. This is to enable
args to be specified per each script.



<a name="0.0.5"></a>
## [0.0.5](https://github.com/Aldlevine/scripteasy/compare/v0.0.4...v0.0.5) (2017-11-17)



<a name="0.0.4"></a>
## [0.0.4](https://github.com/Aldlevine/scripteasy/compare/v0.0.3...v0.0.4) (2017-11-16)


### Bug Fixes

* **scripteasy:** Fix incorrect path for JS/JSON scriptfiles ([bb6394a](https://github.com/Aldlevine/scripteasy/commit/bb6394a))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/Aldlevine/scripteasy/compare/v0.0.2...v0.0.3) (2017-11-16)


### Features

* **cli:** Rename to ez ([84755ac](https://github.com/Aldlevine/scripteasy/commit/84755ac))
* **scripteasy:** Add option of external scripts file ([e8d52f5](https://github.com/Aldlevine/scripteasy/commit/e8d52f5))


### BREAKING CHANGES

* **cli:** The cli command has changed from `tease` to `ez`



<a name="0.0.2"></a>
## [0.0.2](https://github.com/Aldlevine/scripteasy/compare/v0.0.1...v0.0.2) (2017-11-16)


### Bug Fixes

* **cli:** Add missing shebang ([3ce8b3a](https://github.com/Aldlevine/scripteasy/commit/3ce8b3a))
* **cli:** Rename "cli" field to "bin" ([f3a0531](https://github.com/Aldlevine/scripteasy/commit/f3a0531))



<a name="0.0.1"></a>
## [0.0.1](https://github.com/Aldlevine/scripteasy/compare/23cbcac...v0.0.1) (2017-11-16)


### Bug Fixes

* **package:** Rename to scripteasy ([9751aa5](https://github.com/Aldlevine/scripteasy/commit/9751aa5))


### Features

* **init:** Add initial code ([23cbcac](https://github.com/Aldlevine/scripteasy/commit/23cbcac))



