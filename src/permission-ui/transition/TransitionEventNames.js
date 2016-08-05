'use strict';

/**
 * Constant storing event names for ng-route
 * @name permission.ui.PermTransitionEventNames
 *
 * @type {Object.<String,Object>}
 *
 * @property permissionStart {String} Event name called when started checking for permissions
 * @property permissionAccepted {String} Event name called when authorized
 * @property permissionDenies {String} Event name called when unauthorized
 */
var PermTransitionEventNames = {
  permissionStart: '$stateChangePermissionStart',
  permissionAccepted: '$stateChangePermissionAccepted',
  permissionDenies: '$stateChangePermissionDenied'
};

angular
  .module('permission.ui')
  .value('PermTransitionEventNames', PermTransitionEventNames);
