module.exports = function () {
  'use strict';

  return {
    options: {
      jshintrc: '.jshintrc',
      reporter: require('jshint-stylish')
    },
    all: {
      src: ['src/**/*.js']
    },
    test: {
      src: ['<%= paths.test %>']
    }
  };
};