(function () {
  'use strict';

  /**
   * State Access rights map factory
   * @name StatePermissionMapFactory
   *
   * @param TransitionProperties {permission.TransitionProperties} Helper storing ui-router transition parameters
   * @param PermissionMap {permission.PermissionMap}
   *
   * @return {permission.StatePermissionMap}
   */
  function StatePermissionMapFactory(TransitionProperties, PermissionMap) {

    StatePermissionMap.prototype = new PermissionMap();
    StatePermissionMap.constructor = StatePermissionMap;
    StatePermissionMap.prototype.parent = PermissionMap.prototype;


    /**
     * Constructs map object instructing authorization service how to handle authorizing
     * @constructor StatePermissionMap
     * @extends PermissionMap
     * @memberOf permission
     */
    function StatePermissionMap() {
      this.parent.constructor.call(this);

      var toStateObject = TransitionProperties.toState.$$state();
      var toStatePath = toStateObject.path.slice().reverse();

      angular.forEach(toStatePath, function (state) {

        if (state.areSetStatePermissions()) {
          var permissionMap = new PermissionMap(state.data.permissions);
          this.extendPermissionMap(permissionMap);
        }
      }, this);
    }

    /**
     * Extends permission map by pushing to it state's permissions
     * @method
     * @methodOf permission.StatePermissionMap
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

    return StatePermissionMap;
  }

  angular
    .module('permission')
    .factory('StatePermissionMap', StatePermissionMapFactory);
}());