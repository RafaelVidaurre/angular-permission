(function () {
  'use strict';

  /**
   * Interface responsible for managing and emitting events dependent on router implementation
   * @name TransitionEvents
   * @memberOf permission
   */
  function TransitionEvents() {

    this.broadcastPermissionStartEvent = function () {
      throw new Error('Method broadcastPermissionStartEvent in TransitionEvents interface must be implemented');
    };

    this.broadcastPermissionAcceptedEvent = function () {
      throw new Error('Method broadcastPermissionAcceptedEvent in TransitionEvents interface must be implemented');
    };

    this.broadcastPermissionDeniedEvent = function () {
      throw new Error('Method broadcastPermissionDeniedEvent in TransitionEvents interface must be implemented');
    };
  }

  angular
    .module('permission')
    .service('TransitionEvents', TransitionEvents);

}());