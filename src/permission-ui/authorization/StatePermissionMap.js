'use strict';

/**
 * State Access rights map factory
 * @function
 *
 * @param permPermissionMap {permission.permPermissionMap|Function}
 *
 * @return {permission.ui.StatePermissionMap}
 */
function permStatePermissionMap(permPermissionMap) {
  'ngInject';

  StatePermissionMap.prototype = new permPermissionMap();

  /**
   * Constructs map instructing authorization service how to handle authorizing
   * @constructor permission.ui.StatePermissionMap
   * @extends permission.permPermissionMap
   */
  function StatePermissionMap(state) {
    var toStateObject = state.$$state();
    var toStatePath = toStateObject.path;

    angular.forEach(toStatePath, function (state) {
      if (areSetStatePermissions(state)) {
        var permissionMap = new permPermissionMap(state.data.permissions);
        this.extendPermissionMap(permissionMap);
      }
    }, this);
  }

  /**
   * Extends permission map by pushing to it state's permissions
   * @methodOf permission.ui.StatePermissionMap
   *
   * @param permissionMap {permission.permPermissionMap} Compensated permission map
   */
  StatePermissionMap.prototype.extendPermissionMap = function (permissionMap) {
    if (permissionMap.only.length) {
      this.only = this.only.concat([permissionMap.only]);
    }
    if (permissionMap.except.length) {
      this.except = this.except.concat([permissionMap.except]);
    }
    this.redirectTo = permissionMap.redirectTo;
  };


  /**
   * Checks if state has set permissions
   * @methodOf permission.ui.StatePermissionMap
   * @private
   *
   * @returns {boolean}
   */
  function areSetStatePermissions(state) {
    return angular.isDefined(state.data) && angular.isDefined(state.data.permissions);
  }

  return StatePermissionMap;
}

angular
  .module('permission.ui')
  .factory('permStatePermissionMap', permStatePermissionMap);
