module.exports = function () {
  'use strict';

  return {
    options: {
      debug: false,
      dryRun: false,
      coverageDir: '<%= paths.coverage %>',
      force: true,
      recursive: true
    }
  };
};