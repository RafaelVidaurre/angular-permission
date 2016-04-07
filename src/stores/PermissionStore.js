(function () {
  'use strict';

  /**
   * Permission definition storage
   * @name PermissionStore
   * @memberOf permission
   *
   * @param Permission {permission.PermissionFactory} Permission definition factory
   */
  function PermissionStore(Permission) {
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
     * @method
     *
     * @param permissionName {String} Name of defined permission
     * @param validationFunction {Function} Function used to validate if permission is valid
     */
    function definePermission(permissionName, validationFunction) {
      var permission = new Permission(permissionName, validationFunction);
      permissionStore[permissionName] = permission;
    }

    /**
     * Allows to define set of permissionNames with shared validation function on application configuration
     * @method
     * @throws {TypeError}
     *
     * @param permissionNames {Array<String>} Set of permission names
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
     * @method
     *
     * @param permissionName {String} Name of defined permission
     */
    function removePermissionDefinition(permissionName) {
      delete permissionStore[permissionName];
    }

    /**
     * Checks if permission exists
     * @method
     *
     * @param permissionName {String} Name of defined permission
     * @returns {Boolean}
     */
    function hasPermissionDefinition(permissionName) {
      return angular.isDefined(permissionStore[permissionName]);
    }

    /**
     * Returns permission by it's name
     * @method
     *
     * @returns {permission.Permission} Permissions definition object
     */
    function getPermissionDefinition(permissionName) {
      return permissionStore[permissionName];
    }

    /**
     * Returns all permissions
     * @method
     *
     * @returns {Object} Permissions collection
     */
    function getStore() {
      return permissionStore;
    }

    /**
     * Removes all permissions
     * @method
     */
    function clearStore() {
      permissionStore = {};
    }
  }

  angular
    .module('permission')
    .service('PermissionStore', PermissionStore);
}());