(function () {
  'use strict';

  angular
    .module('permission')
    .service('RoleStore', function (Role) {
      var roleStore = {};

      this.defineRole = defineRole;
      this.getRoleDefinition = getRoleDefinition;
      this.hasRoleDefinition = hasRoleDefinition;
      this.removeRoleDefinition = removeRoleDefinition;
      this.getStore = getStore;
      this.clearStore = clearStore;

      /**
       * Allows to define role
       *
       * @param roleName {String} Name of defined role
       * @param permissions {Array} Set of permission names
       * @param [validationFunction] {Function} Function used to validate if permissions in role are valid
       */
      function defineRole(roleName, permissions, validationFunction) {
        roleStore[roleName] = new Role(roleName, permissions, validationFunction);
      }

      /**
       * Deletes role from store
       *
       * @param roleName {String} Name of defined permission
       */
      function removeRoleDefinition(roleName) {
        delete roleStore[roleName];
      }

      /**
       * Checks if role is defined in store
       *
       * @param roleName {String} Name of role
       * @returns {Boolean}
       */
      function hasRoleDefinition(roleName) {
        return angular.isDefined(roleStore[roleName]);
      }

      /**
       * Returns role definition object by it's name
       *
       * @returns {Object} Role definition object
       */
      function getRoleDefinition(roleName) {
        return roleStore[roleName];
      }

      /**
       * Returns all role definitions
       *
       * @returns {Object} Defined roles collection
       */
      function getStore() {
        return roleStore;
      }

      /**
       * Removes all role definitions
       */
      function clearStore() {
        roleStore = {};
      }
    });
}());