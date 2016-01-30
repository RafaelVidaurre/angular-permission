(function () {
  'use strict';

  angular
    .module('permission')
    .service('PermissionStore', function (Permission) {
      var permissionStore = {};

      this.definePermission = definePermission;
      this.defineManyPermissions = defineManyPermissions;
      this.removePermissionDefinition = removePermissionDefinition;
      this.hasPermissionDefinition = hasPermissionDefinition;
      this.getPermissionDefinition = getPermissionDefinition;
      this.getStore = getStore;
      this.clearStore = clearStore;

      /**
       * Allows to define permission on application configuration
       *
       * @param permissionName {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function definePermission(permissionName, validationFunction) {
        permissionStore[permissionName] = new Permission(permissionName, validationFunction);
      }

      /**
       * Allows to define set of permissionNames with shared validation function on application configuration
       *
       * @param permissionNames {Array} Set of permission names
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function defineManyPermissions(permissionNames, validationFunction) {
        if (!angular.isArray(permissionNames)) {
          throw new TypeError('Parameter "permissionNames" name must be Array');
        }

        angular.forEach(permissionNames, function (permissionName) {
          definePermission(permissionName, validationFunction);
        });
      }

      /**
       * Deletes permission
       *
       * @param permissionName {String} Name of defined permission
       */
      function removePermissionDefinition(permissionName) {
        delete permissionStore[permissionName];
      }

      /**
       * Checks if permission exists
       *
       * @param permissionName {String} Name of defined permission
       * @returns {Boolean}
       */
      function hasPermissionDefinition(permissionName) {
        return angular.isDefined(permissionStore[permissionName]);
      }

      /**
       * Returns permission by it's name
       *
       * @returns {Object} Permissions collection
       */
      function getPermissionDefinition(permissionName) {
        return permissionStore[permissionName];
      }

      /**
       * Returns all permissions
       *
       * @returns {Object} Permissions collection
       */
      function getStore() {
        return permissionStore;
      }

      /**
       * Removes all permissions
       */
      function clearStore() {
        permissionStore = {};
      }
    });
}());