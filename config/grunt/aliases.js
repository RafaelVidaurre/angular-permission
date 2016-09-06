module.exports = function () {
  'use strict';

  return {
    'build': [
      'jshint',
      'clean',
      'concat',
      'ngAnnotate',
      'beautifier',
      'uglify',
      'test',
      'coveralls'
    ],
    'test': [
      'test:unit',
      'test:e2e'
    ],
    'test:unit': [
      'karma'
    ],
    'test:e2e': [
      'connect',
      'protractor'
    ]
  };
};