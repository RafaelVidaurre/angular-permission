(function () {
  'use strict';

  angular
    .module('permission')
    .service('PermissionStore', function (Permission) {
      var permissionStore = {};

      this.defineRole = defineRole;
      this.defineManyRoles = defineManyRoles;
      this.definePermission = definePermission;
      this.defineManyPermissions = defineManyPermissions;
      this.removePermission = removePermission;
      this.removeManyPermissions = removeManyPermissions;
      this.hasPermission = hasPermission;
      this.getPermission = getPermission;
      this.getPermissions = getPermissions;
      this.clearPermissions = clearPermissions;

      /**
       * Allows to define permission on application configuration
       * @deprecated
       *
       * @param permissionName {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function defineRole(permissionName, validationFunction) {
        console.warn('Function "defineRole" will be deprecated. Use "definePermission" instead');
        definePermission(permissionName, validationFunction);
      }

      /**
       * Allows to define set of permissions with shared validation function in runtime
       * @deprecated
       *
       * @param permissionNames {Array} Set of permission names
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function defineManyRoles(permissionNames, validationFunction) {
        console.warn('Function "defineManyRoles" will be deprecated. Use "defineManyPermissions" instead');
        defineManyPermissions(permissionNames, validationFunction);
      }

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
      function removePermission(permissionName) {
        delete permissionStore[permissionName];
      }

      /**
       * Deletes set of permissions
       *
       * @param permissionNames {Array} Set of permission names
       */
      function removeManyPermissions(permissionNames) {
        angular.forEach(permissionNames, function (permission) {
          delete permissionStore[permission];
        });
      }

      /**
       * Checks if permission exists
       *
       * @param permissionName {String} Name of defined permission
       * @returns {Boolean}
       */
      function hasPermission(permissionName) {
        return angular.isDefined(permissionStore[permissionName]);
      }

      /**
       * Returns permission by it's name
       *
       * @returns {Object} Permissions collection
       */
      function getPermission(permissionName) {
        return permissionStore[permissionName];
      }

      /**
       * Returns all permissions
       *
       * @returns {Object} Permissions collection
       */
      function getPermissions() {
        return permissionStore;
      }

      /**
       * Removes all permissions
       */
      function clearPermissions() {
        permissionStore = [];
      }
    });
}());