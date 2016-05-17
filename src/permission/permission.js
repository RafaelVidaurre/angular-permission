(function () {
  'use strict';

  /**
   * @namespace permission
   */

  var permission = angular.module('permission', []);

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = permission.name;
  }

  return permission;
}());
