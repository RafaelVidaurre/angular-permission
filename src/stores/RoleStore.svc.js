(function () {
  'use strict';

  angular
    .module('permission')
    .service('RoleStore', function (Role) {
      var roleStore = {};

      this.defineRole = defineRole;
      this.removeRoleDefinition = removeRoleDefinition;
      this.removeManyRoleDefinitions = removeManyRoleDefinitions;
      this.hasDefinedRole = hasDefinedRole;
      this.getRoleDefinition = getRoleDefinition;
      this.getStore = getStore;
      this.clearStore = clearStore;

      /**
       * Allows to define role
       *
       * @param roleName {String} Name of defined role
       * @param permissions {Array} Set of permission names
       * @param validationFunction {Function} Function used to validate if permissions in role are valid
       */
      function defineRole(roleName, permissions, validationFunction) {
        roleStore[roleName] = new Role(roleName, permissions, validationFunction);
      }

      /**
       * Deletes permission
       *
       * @param permissionName {String} Name of defined permission
       */
      function removeRoleDefinition(permissionName) {
        delete roleStore[permissionName];
      }

      /**
       * Deletes set of permissions
       *
       * @param permissionNames {Array} Set of permission names
       */
      function removeManyRoleDefinitions(permissionNames) {
        angular.forEach(permissionNames, function (permission) {
          delete roleStore[permission];
        });
      }

      /**
       * Checks if permission exists
       *
       * @param permissionName {String} Name of defined permission
       * @returns {Boolean}
       */
      function hasDefinedRole(permissionName) {
        return angular.isDefined(roleStore[permissionName]);
      }

      /**
       * Returns permission by it's name
       *
       * @returns {Object} Permissions collection
       */
      function getRoleDefinition(permissionName) {
        return roleStore[permissionName];
      }

      /**
       * Returns all permissions
       *
       * @returns {Object} Permissions collection
       */
      function getStore() {
        return roleStore;
      }

      /**
       * Removes all permissions
       */
      function clearStore() {
        roleStore = [];
      }
    });
}());