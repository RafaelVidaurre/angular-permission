'use strict';

/**
 * Interface responsible for managing and emitting events dependent on router implementation
 * @name permission.PermTransitionEvents
 */
function PermTransitionEvents() {
  'ngInject';

  this.broadcastPermissionStartEvent = function () {
    throw new Error('Method broadcastPermissionStartEvent in PermTransitionEvents interface must be implemented');
  };

  this.broadcastPermissionAcceptedEvent = function () {
    throw new Error('Method broadcastPermissionAcceptedEvent in PermTransitionEvents interface must be implemented');
  };

  this.broadcastPermissionDeniedEvent = function () {
    throw new Error('Method broadcastPermissionDeniedEvent in PermTransitionEvents interface must be implemented');
  };
}

angular
  .module('permission')
  .service('PermTransitionEvents', PermTransitionEvents);
