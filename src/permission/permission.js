'use strict';

/**
 * @namespace permission
 */

var permission = angular.module('permission', []);

/* istanbul ignore if  */
if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
  module.exports = permission.name;
}