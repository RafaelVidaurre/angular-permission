module.exports = function () {
  'use strict';

  return {
    'build': [
      'jshint',
      'test',
      'coveralls',
      'clean',
      'concat',
      'ngAnnotate',
      'beautifier',
      'uglify'
    ],
    'test': [
      'test:unit',
      'test:e2e'
    ],
    'test:unit': [
      'karma'
    ],
    'test:e2e': [
      'protractor'
    ]
  };
};