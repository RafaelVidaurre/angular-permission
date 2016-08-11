'use strict';

/**
 * Permission definition storage
 * @name permission.PermPermissionStore
 *
 * @param PermPermission {permission.PermPermission|Function}
 */
function PermPermissionStore(PermPermission) {
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
   * @methodOf permission.PermPermissionStore
   *
   * @param permissionName {String} Name of defined permission
   * @param validationFunction {Function} Function used to validate if permission is valid
   */
  function definePermission(permissionName, validationFunction) {
    permissionStore[permissionName] = new PermPermission(permissionName, validationFunction);
  }

  /**
   * Allows to define set of permissionNames with shared validation function on application configuration
   * @methodOf permission.PermPermissionStore
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
   * @methodOf permission.PermPermissionStore
   *
   * @param permissionName {String} Name of defined permission
   */
  function removePermissionDefinition(permissionName) {
    delete permissionStore[permissionName];
  }

  /**
   * Checks if permission exists
   * @methodOf permission.PermPermissionStore
   *
   * @param permissionName {String} Name of defined permission
   * @returns {Boolean}
   */
  function hasPermissionDefinition(permissionName) {
    return angular.isDefined(permissionStore[permissionName]);
  }

  /**
   * Returns permission by it's name
   * @methodOf permission.PermPermissionStore
   *
   * @returns {permission.Permission} Permissions definition object
   */
  function getPermissionDefinition(permissionName) {
    return permissionStore[permissionName];
  }

  /**
   * Returns all permissions
   * @methodOf permission.PermPermissionStore
   *
   * @returns {Object} Permissions collection
   */
  function getStore() {
    return permissionStore;
  }

  /**
   * Removes all permissions
   * @methodOf permission.PermPermissionStore
   */
  function clearStore() {
    permissionStore = {};
  }
}

angular
  .module('permission')
  .service('PermPermissionStore', PermPermissionStore);
