(function () {
  'use strict';

  /**
   * Constant storing event names for ng-route
   * @name TransitionEventNames
   * @memberOf permission.ui
   *
   * @type {Object.<String,Object>}
   *
   * @property permissionStart {String} Event name called when started checking for permissions
   * @property permissionAccepted {String} Event name called when authorized
   * @property permissionDenies {String} Event name called when unauthorized
   */
  var TransitionEventNames = {
    permissionStart: '$routeChangePermissionStart',
    permissionAccepted: '$routeChangePermissionAccepted',
    permissionDenies: '$routeChangePermissionDenied'
  };

  angular
    .module('permission.ng')
    .value('TransitionEventNames', TransitionEventNames);

}());