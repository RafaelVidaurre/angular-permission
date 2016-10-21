'use strict';

/**
 * State Access rights map factory
 * @function
 *
 * @param PermPermissionMap {permission.PermPermissionMap|Function}
 *
 * @return {permission.ui.StatePermissionMap}
 */
function PermStatePermissionMap(PermPermissionMap) {
  'ngInject';

  StatePermissionMap.prototype = new PermPermissionMap();

  /**
   * Constructs map instructing authorization service how to handle authorizing
   * @constructor permission.ui.StatePermissionMap
   * @extends permission.PermPermissionMap
   */
  function StatePermissionMap(state) {
    var toStateObject = state.$$permissionState();
    var toStatePath = toStateObject.path;

    angular.forEach(toStatePath, function (state) {
      if (areSetStatePermissions(state)) {
        var permissionMap = new PermPermissionMap(state.data.permissions);
        this.extendPermissionMap(permissionMap);
      }
    }, this);
  }

  /**
   * Extends permission map by pushing to it state's permissions
   * @methodOf permission.ui.StatePermissionMap
   *
   * @param permissionMap {permission.PermPermissionMap} Compensated permission map
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
   * We check for hasOwnProperty, because ui-router lets the `data` property inherit from its parent
   * @methodOf permission.ui.StatePermissionMap
   * @private
   *
   * @returns {boolean}
   */
  function areSetStatePermissions(state) {
    try {
      return Object.prototype.hasOwnProperty.call(state.data, 'permissions');
    } catch (e) {
      return false;
    }
  }

  return StatePermissionMap;
}

angular
  .module('permission.ui')
  .factory('PermStatePermissionMap', PermStatePermissionMap);
