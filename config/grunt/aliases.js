module.exports = function () {
  'use strict';

  return {
    default: {
      description: 'Development mode watching for file changes',
      tasks: [
        'watch'
      ]
    },
    build: {
      description: 'Creates production code of library',
      tasks: [
        'jshint',
        'karma',
        'clean',
        'concat',
        'ngAnnotate',
        'uglify'
      ]
    },
    test: {
      description: 'Runs unit tests',
      tasks: [
        'karma'
      ]
    }
  };
};