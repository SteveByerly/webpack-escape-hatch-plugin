'use strict';

const chalk = require('chalk');

function WebpackEscapeHatchPlugin(options) {
  const DEBUG = 0;
  const INFO = 1;
  const WARNING = 2;
  const ERROR = 3;

  this.LOG_LEVELS = {
    debug: DEBUG,
    info: INFO,
    warning: WARNING,
    error: ERROR,
  };

  this.LOG_COLORS = {
    [WARNING]: chalk.yellow,
    [ERROR]: chalk.red,
  };

  this.logLevel = WARNING;
  this.logger = {
    error: msg => this.log(msg, ERROR),
    warning: msg => this.log(msg, WARNING),
    info: msg => this.log(msg, INFO),
    debug: msg => this.log(msg, DEBUG),
  };

  this.parseOptions(options);
}

WebpackEscapeHatchPlugin.prototype.parseOptions = function (options) {
  const opts = options || {};

  if (opts.colors == null) {
    opts.colors = true;
  }

  opts.exitWatch = opts.exitWatch || false;
  opts.logLevel = opts.logLevel || 'error';
  chalk.enabled = opts.colors === true;
  this.logLevel = this.LOG_LEVELS[opts.logLevel] || this.WARNING;
  this.options = opts;
};

WebpackEscapeHatchPlugin.prototype.log = function (msg, level) {
  if (level >= this.logLevel) {
    const color = this.LOG_COLORS[level] || chalk.reset;
    // eslint-disable-next-line no-console
    console.log(color(`[WebpackEscapeHatchPlugin] ${msg}`));
  }
};

WebpackEscapeHatchPlugin.prototype.apply = function (compiler) {
  let isWatching = false;

  compiler.plugin('watch-run', (watching, callback) => {
    isWatching = true;
    callback();
  });

  compiler.plugin('done', (stats) => {
    if (stats.compilation.warnings.length > 0) {
      this.logger.warn('Warnings found during compilation:');
      stats.compilation.warnings.forEach((warning) => {
        this.logger.warn(`${warning.message || warning}`);
      });
    }

    if (stats.compilation.errors.length > 0) {
      this.logger.error('Errors found during compilation:');
      stats.compilation.errors.forEach((error) => {
        this.logger.error(`${error.message || error}`);
      });

      isWatching = isWatching || compiler.options.watch;

      if (!isWatching || this.options.exitWatch) {
        this.logger.error('Exiting the process');
        process.exit(1);
      }
    }
  });
};

module.exports = WebpackEscapeHatchPlugin;
