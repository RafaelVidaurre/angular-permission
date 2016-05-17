module.exports = function () {
  'use strict';

  return {
    default: {
      src: [
        'dist/angular-permission.js',
        'dist/angular-permission-ui.js',
        'dist/angular-permission-ng.js'
      ],
      options: {
        js: {
          indentSize: 2,
          spaceAfterAnonFunction: true
        }
      }
    }
  };
};