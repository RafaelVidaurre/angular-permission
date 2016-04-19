(function () {
  'use strict';

  /**
   * Constant storing event names for ng-route
   * @name permission.ui.TransitionEventNames
   *
   * @type {Object.<String,Object>}
   *
   * @property permissionStart {String} Event name called when started checking for permissions
   * @property permissionAccepted {String} Event name called when authorized
   * @property permissionDenies {String} Event name called when unauthorized
   */
  var TransitionEventNames = {
    permissionStart: '$stateChangePermissionStart',
    permissionAccepted: '$stateChangePermissionAccepted',
    permissionDenies: '$stateChangePermissionDenied'
  };

  angular
    .module('permission.ui')
    .value('TransitionEventNames', TransitionEventNames);

}());