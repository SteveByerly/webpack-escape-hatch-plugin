'use strict';

const chalk = require('chalk');

function WebpackEscapeHatchPlugin(options) {
  if (!options) {
    options= {};
  }

  if (options.colors == null) {
    options.colors = true;
  }

  options.exitWatch = options.exitWatch || false;
  options.verbose = options.verbose || false;
  this.options = options;

  chalk.enabled = options.colors === true;
};

WebpackEscapeHatchPlugin.prototype.apply = function(compiler) {
  const options = this.options;

  compiler.plugin('done', function(stats) {
    if (stats.compilation.warnings.length > 0 && this.options.verbose) {
      console.warn(chalk.yellow(`[WebpackEscapeHatchPlugin] Warnings found during compilation:`));
      stats.compilation.warnings.forEach((warning) => {
        const msg = warning.message || warning;
        console.warn(chalk.yellow(`    ${msg}`));
      });
    }

    if (stats.compilation.errors.length > 0) {
      console.error(chalk.red(`[WebpackEscapeHatchPlugin] Errors found during compilation:`));
      stats.compilation.errors.forEach((error) => {
        const msg = error.message || error;
        console.error(chalk.red(`    ${msg}`));
      });

      if (!this.options.watch || options.exitWatch) {
        console.error(chalk.red(`[WebpackEscapeHatchPlugin] Exiting the process`));
        process.exit(1);
      }
    }
  });
};

module.exports = WebpackEscapeHatchPlugin;
