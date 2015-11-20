module.exports = function () {
  'use strict';

  return {
    options: {
      banner: '<%= meta.banner %>\n'
    },
    dist: {
      files: {
        'dist/<%= pkg.name %>.js': ['<%= paths.src %>/*']
      }
    }
  };
};