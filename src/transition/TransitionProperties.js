(function () {
  'use strict';

  angular
    .module('permission')
    .value('TransitionProperties',
      /**
       * Helper object used for storing ui-router transition parameters
       * @class TransitionProperties
       * @memberOf permission
       *
       * @property toState {Object} Target state object
       * @property toParams {Object} Target state params
       * @property fromState {Object} Source state object
       * @property fromParams {Object} Source state params
       * @property options {Object} Transition options
       */
      {
        toState: undefined,
        toParams: undefined,
        fromState: undefined,
        fromParams: undefined,
        options: undefined
      }
    );
}());