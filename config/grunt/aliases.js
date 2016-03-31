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
      'uglify'
    ],
    test: [
      'karma'
    ]
  };
};