'use strict';

/**
 * Role definition storage
 * @name permission.RoleStore
 *
 * @param Role {permission.Role|Function} Role definition constructor
 */
function RoleStore(Role) {
  'ngInject';

  var roleStore = {};

  this.defineRole = defineRole;
  this.defineManyRoles = defineManyRoles;
  this.getRoleDefinition = getRoleDefinition;
  this.hasRoleDefinition = hasRoleDefinition;
  this.removeRoleDefinition = removeRoleDefinition;
  this.getStore = getStore;
  this.clearStore = clearStore;

  /**
   * Allows to add single role definition to the store by providing it's name and validation function
   * @methodOf permission.RoleStore
   *
   * @param roleName {String} Name of defined role
   * @param [validationFunction] {Function|Array<String>} Function used to validate if role is valid or set of
   *   permission names that has to be owned to have a role
   */
  function defineRole(roleName, validationFunction) {
    roleStore[roleName] = new Role(roleName, validationFunction);
  }

  /**
   * Allows to define set of roleNames with shared validation function
   * @methodOf permission.PermissionStore
   * @throws {TypeError}
   *
   * @param roleMap {String, Function|Array<String>} Map of roles with matching validators
   */
  function defineManyRoles(roleMap) {
    if (!angular.isObject(roleMap)) {
      throw new TypeError('Parameter "roleNames" name must be object');
    }

    angular.forEach(roleMap, function (validationFunction, roleName) {
      defineRole(roleName, validationFunction);
    });
  }

  /**
   * Deletes role from store
   * @method permission.RoleStore
   *
   * @param roleName {String} Name of defined permission
   */
  function removeRoleDefinition(roleName) {
    delete roleStore[roleName];
  }

  /**
   * Checks if role is defined in store
   * @method permission.RoleStore
   *
   * @param roleName {String} Name of role
   * @returns {Boolean}
   */
  function hasRoleDefinition(roleName) {
    return angular.isDefined(roleStore[roleName]);
  }

  /**
   * Returns role definition object by it's name
   * @method permission.RoleStore
   *
   * @returns {permission.Role} Role definition object
   */
  function getRoleDefinition(roleName) {
    return roleStore[roleName];
  }

  /**
   * Returns all role definitions
   * @method permission.RoleStore
   *
   * @returns {Object} Defined roles collection
   */
  function getStore() {
    return roleStore;
  }

  /**
   * Removes all role definitions
   * @method permission.RoleStore
   */
  function clearStore() {
    roleStore = {};
  }
}

angular
  .module('permission')
  .service('RoleStore', RoleStore);