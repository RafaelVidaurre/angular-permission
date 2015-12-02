module.exports = function () {
  'use strict';

  return {
    js: {
      files: ['<%= paths.src %>/**/*.js'],
      tasks: ['newer:jshint:all']
    },
    test: {
      files: ['<%= paths.src %>/**/*.test.js'],
      tasks: ['newer:jshint:test', 'karma']
    }
  };
};