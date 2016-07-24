'use strict';

/**
 * Permission definition storage
 * @name permission.permPermissionStore
 *
 * @param permPermission {permission.permPermission|Function}
 */
function permPermissionStore(permPermission) {
  'ngInject';

  /**
   * @property permissionStore
   *
   * @type {Object}
   */
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
   * @methodOf permission.permPermissionStore
   *
   * @param permissionName {String} Name of defined permission
   * @param validationFunction {Function} Function used to validate if permission is valid
   */
  function definePermission(permissionName, validationFunction) {
    permissionStore[permissionName] = new permPermission(permissionName, validationFunction);
  }

  /**
   * Allows to define set of permissionNames with shared validation function on application configuration
   * @methodOf permission.permPermissionStore
   * @throws {TypeError}
   *
   * @param permissionNames {Array<Number>} Set of permission names
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
   * @methodOf permission.permPermissionStore
   *
   * @param permissionName {String} Name of defined permission
   */
  function removePermissionDefinition(permissionName) {
    delete permissionStore[permissionName];
  }

  /**
   * Checks if permission exists
   * @methodOf permission.permPermissionStore
   *
   * @param permissionName {String} Name of defined permission
   * @returns {Boolean}
   */
  function hasPermissionDefinition(permissionName) {
    return angular.isDefined(permissionStore[permissionName]);
  }

  /**
   * Returns permission by it's name
   * @methodOf permission.permPermissionStore
   *
   * @returns {permission.Permission} Permissions definition object
   */
  function getPermissionDefinition(permissionName) {
    return permissionStore[permissionName];
  }

  /**
   * Returns all permissions
   * @methodOf permission.permPermissionStore
   *
   * @returns {Object} Permissions collection
   */
  function getStore() {
    return permissionStore;
  }

  /**
   * Removes all permissions
   * @methodOf permission.permPermissionStore
   */
  function clearStore() {
    permissionStore = {};
  }
}

angular
  .module('permission')
  .service('permPermissionStore', permPermissionStore)
  .service('PermissionStore', permPermissionStore);