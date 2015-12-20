(function () {
  'use strict';

  angular.module('permission')
    .provider('PermissionStore', function () {
      var permissionStore = {};
      var self = this;

      this.defineRole = defineRole;
      this.setPermission = setPermission;
      this.setManyPermissions = setManyPermissions;

      this.$get = [function () {
        return {
          defineRole: defineRole,
          defineManyRoles: defineManyRoles,
          setPermission: setPermission,
          setManyPermissions: setManyPermissions,
          removePermission: removePermission,
          removeManyPermissions: removeManyPermissions,
          hasPermission: hasPermission,
          getPermission: getPermission,
          getPermissions: getPermissions,
          clearPermissions: clearPermissions
        };
      }];

      /**
       * Allows to define permission on application configuration
       * @deprecated
       *
       * @param permission {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function defineRole(permission, validationFunction) {
        console.warn('Function "defineRole" will be deprecated. Use "setPermission" instead');
        self.setPermission(permission, validationFunction);
      }


      /**
       * Allows to define permission on application configuration
       *
       * @param permission {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function setPermission(permission, validationFunction) {
        validatePermission(permission, validationFunction);
        permissionStore[permission] = validationFunction;
      }

      /**
       * Allows to define set of permissions with shared validation function in runtime
       * @deprecated
       *
       * @param permissions {Array} Set of permission names
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function defineManyRoles(permissions, validationFunction) {
        console.warn('Function "defineManyRoles" will be deprecated. Use "setManyPermissions" instead');
        self.setManyPermissions(permissions, validationFunction);
      }


      /**
       * Allows to define set of permissions with shared validation function on application configuration
       *
       * @param permissions {Array} Set of permission names
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function setManyPermissions(permissions, validationFunction) {
        if (!angular.isArray(permissions)) {
          throw new TypeError('Parameter "permissions" name must be Array');
        }

        angular.forEach(permissions, function (permissionName) {
          self.setPermission(permissionName, validationFunction);
        });
      }

      /**
       * Checks if provided permission has accepted parameter types
       * @private
       *
       * @param permission {String} Name of defined permission
       * @param validationFunction {Function} Function used to validate if permission is valid
       */
      function validatePermission(permission, validationFunction) {
        if (!angular.isString(permission)) {
          throw new TypeError('Parameter "permission" name must be String');
        }
        if (!angular.isFunction(validationFunction)) {
          throw new TypeError('Parameter "validationFunction" must be Function');
        }
      }

      /**
       * Deletes permission
       *
       * @param permission {String} Name of defined permission
       */
      function removePermission(permission) {
        delete permissionStore[permission];
      }

      /**
       * Deletes set of permissions
       *
       * @param permissions {Array} Set of permission names
       */
      function removeManyPermissions(permissions) {
        angular.forEach(permissions, function (permission) {
          delete permissionStore[permission];
        });
      }

      /**
       * Checks if permission exists
       *
       * @param permission {String} Name of defined permission
       * @returns {Boolean}
       */
      function hasPermission(permission) {
        return angular.isDefined(permissionStore[permission]);
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