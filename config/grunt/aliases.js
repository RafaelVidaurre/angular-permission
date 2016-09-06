module.exports = function () {
  'use strict';

  return {
    'build': [
      'jshint',
      'test:unit',
      'coveralls',
      'clean',
      'concat',
      'ngAnnotate',
      'beautifier',
      'uglify',
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