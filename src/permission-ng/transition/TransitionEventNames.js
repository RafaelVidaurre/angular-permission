'use strict';

/**
 * Constant storing event names for ng-route
 * @name permission.ng.TransitionEventNames
 *
 * @type {Object.<String,Object>}
 *
 * @property permissionStart {String} Event name called when started checking for permissions
 * @property permissionAccepted {String} Event name called when authorized
 * @property permissionDenied {String} Event name called when unauthorized
 */
var TransitionEventNames = {
  permissionStart: '$routeChangePermissionStart',
  permissionAccepted: '$routeChangePermissionAccepted',
  permissionDenied: '$routeChangePermissionDenied'
};

angular
  .module('permission.ng')
  .value('TransitionEventNames', TransitionEventNames);
