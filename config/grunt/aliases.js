module.exports = function () {
  'use strict';

  return {
    build: [
      'jshint',
      'karma',
      'coveralls',
      'clean',
      'concat',
      'ngAnnotate',
      'beautifier',
      'uglify'
    ],
    test: [
      'karma'
    ]
  };
};