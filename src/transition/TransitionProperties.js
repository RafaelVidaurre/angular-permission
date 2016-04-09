(function () {
  'use strict';

  /**
   * Helper object used for storing ui-router transition parameters
   * @name TransitionProperties
   * @memberOf permission
   *
   * @type {Object.<String,Object>}
   *
   * UI-router transition properties:
   * @property toState {Object} Target state object
   * @property toParams {Object} Target state params
   * @property fromState {Object} Source state object
   * @property fromParams {Object} Source state params
   * @property options {Object} Transition options
   */
  var TransitionProperties = {
    toState: undefined,
    toParams: undefined,
    fromState: undefined,
    fromParams: undefined,
    options: undefined
  };

  angular
    .module('permission')
    .value('TransitionProperties', TransitionProperties);

}());