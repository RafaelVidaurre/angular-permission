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
    default: {
      files: {
        'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
      }
    }
  };
};