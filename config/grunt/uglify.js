module.exports = function () {
  'use strict';

  return {
    options: {
      banner: '<%= meta.banner %>',
      mangle: {
        except: ['angular']
      },
      sourceMap: true
    },
    permission: {
      options: {
        banner: '<%= meta["banner"] %>'
      },
      files: {
        '<%= paths.dist %>/<%= pkg.name %>.min.js': ['<%= paths.dist %>/<%= pkg.name %>.js']
      }
    },
    'permission-ui': {
      options: {
        banner: '<%= meta["banner-ui"] %>'
      },
      files: {
        '<%= paths.dist %>/<%= pkg.name %>-ui.min.js': ['<%= paths.dist %>/<%= pkg.name %>-ui.js']
      }
    },
    'permission-ng': {
      options: {
        banner: '<%= meta["banner-ng"] %>'
      },
      files: {
        '<%= paths.dist %>/<%= pkg.name %>-ng.min.js': ['<%= paths.dist %>/<%= pkg.name %>-ng.js']
      }
    }
  };
};