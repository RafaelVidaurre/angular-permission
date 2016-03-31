module.exports = function () {
  'use strict';

  return {
    dist: {
      files: [{
        src: [
          '<%= paths.dist %>',
          '<%= paths.coverage %>'
        ]
      }]
    }
  };
};