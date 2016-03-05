module.exports = function () {
  'use strict';

  return {
    build: [
      'jshint',
      'karma',
      'clean',
      'concat',
      'ngAnnotate',
      'uglify'
    ],
    test: [
      'karma'
    ]
  };
};