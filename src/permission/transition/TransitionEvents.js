'use strict';

/**
 * Interface responsible for managing and emitting events dependent on router implementation
 * @name permission.permTransitionEvents
 */
function permTransitionEvents() {
  'ngInject';

  this.broadcastPermissionStartEvent = function () {
    throw new Error('Method broadcastPermissionStartEvent in permTransitionEvents interface must be implemented');
  };

  this.broadcastPermissionAcceptedEvent = function () {
    throw new Error('Method broadcastPermissionAcceptedEvent in permTransitionEvents interface must be implemented');
  };

  this.broadcastPermissionDeniedEvent = function () {
    throw new Error('Method broadcastPermissionDeniedEvent in permTransitionEvents interface must be implemented');
  };
}

angular
  .module('permission')
  .service('permTransitionEvents', permTransitionEvents);
