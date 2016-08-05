'use strict';

/**
 * Constant storing event names for ng-route
 * @name permission.ng.PermTransitionEventNames
 *
 * @type {Object.<String,Object>}
 *
 * @property permissionStart {String} Event name called when started checking for permissions
 * @property permissionAccepted {String} Event name called when authorized
 * @property permissionDenied {String} Event name called when unauthorized
 */
var PermTransitionEventNames = {
  permissionStart: '$routeChangePermissionStart',
  permissionAccepted: '$routeChangePermissionAccepted',
  permissionDenied: '$routeChangePermissionDenied'
};

angular
  .module('permission.ng')
  .value('PermTransitionEventNames', PermTransitionEventNames);
