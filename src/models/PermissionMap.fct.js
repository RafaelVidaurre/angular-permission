(function () {
  'use strict';

  angular
    .module('permission')
    .factory('PermissionMap', function () {

      function PermissionMap(permissionMap) {
        validateConstructor(permissionMap);
        this.only = permissionMap.only;
        this.except = permissionMap.except;
        this.redirectTo = permissionMap.redirectTo;
      }

      /**
       * Checks if provided permission map has accepted parameter types
       * @private
       *
       * @param permissionMap {Object}
       */
      function validateConstructor(permissionMap) {
        if (!angular.isObject(permissionMap)) {
          throw new TypeError('Parameter "permissionMap" has to be Object');
        }

        if (angular.isUndefined(permissionMap.only) && angular.isUndefined(permissionMap.except)) {
          throw new ReferenceError('Either "only" or "except" keys must me defined');
        }

        if (!(angular.isArray(permissionMap.only) || angular.isArray(permissionMap.except))) {
          throw new TypeError('Parameter "permissionMap" properties must be Array');
        }
      }

      return PermissionMap;
    });
}());