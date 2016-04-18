(function () {
  'use strict';

  /**
   * State Access rights map factory
   * @function
   *
   * @param TransitionProperties {permission.TransitionProperties} Helper storing ui-router transition parameters
   * @param PermissionMap {permission.PermissionMap}
   *
   * @return {StatePermissionMap}
   */
  function StatePermissionMapFactory(TransitionProperties, PermissionMap) {

    StatePermissionMap.prototype = new PermissionMap();

    /**
     * Constructs map object instructing authorization service how to handle authorizing
     * @constructor permission.ui.StatePermissionMap
     * @extends permission.PermissionMap
     */
    function StatePermissionMap() {
      var toStateObject = TransitionProperties.toState.$$state();
      var toStatePath = toStateObject.path.slice().reverse();

      angular.forEach(toStatePath, function (state) {
        if (areSetStatePermissions(state)) {
          var permissionMap = new PermissionMap(state.data.permissions);
          this.extendPermissionMap(permissionMap);
        }
      }, this);
    }

    /**
     * Extends permission map by pushing to it state's permissions
     * @methodOf permission.ui.StatePermissionMap
     *
     * @param permissionMap {permission.PermissionMap} Compensated permission map
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
    function areSetStatePermissions (state) {
      return angular.isDefined(state.data) && angular.isDefined(state.data.permissions);
    }

    return StatePermissionMap;
  }

  angular
    .module('permission.ui')
    .factory('StatePermissionMap', StatePermissionMapFactory);
}());