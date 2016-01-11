module.exports = function () {
  'use strict';

  return {
    options: {
      singleQuotes: true
    },
    default: {
      files: [{
        expand: true,
        src: ['<%= paths.dist %>/angular-permission.js']
      }]
    }
  };
};