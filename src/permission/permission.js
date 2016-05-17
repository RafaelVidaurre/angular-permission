(function () {
  'use strict';

  /**
   * @namespace permission
   */

  var permission = angular.module('permission', []);

  if (angular.isDefined(module)) {
    module.exports = permission.name;
  }

  return permission;
}());
