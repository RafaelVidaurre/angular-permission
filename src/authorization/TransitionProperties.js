(function () {
  'use strict';

  angular
    .module('permission')
    .service('TransitionProperties',
      /**
       * Helper object used for storing ui-router transition parameters
       * @class TransitionProperties
       * @memberOf permission
       */
      function () {

        var transitionProperties = {
          toState: undefined,
          toParams: undefined,
          fromState: undefined,
          fromParams: undefined,
          options: undefined
        };

        this.set = set;
        this.get = get;

        /**
         * Sets transition properties
         * @method
         *
         * @param toState {Object} Target state object
         * @param toParams {Object} Target state params
         * @param fromState {Object} Source state object
         * @param fromParams {Object} Source state params
         * @param options {Object} Transition options
         */
        function set(toState, toParams, fromState, fromParams, options) {
          transitionProperties.toState = toState;
          transitionProperties.toParams = toParams;
          transitionProperties.fromState = fromState;
          transitionProperties.fromParams = fromParams;
          transitionProperties.options = options;
        }

        /**
         * Return transition properties object
         * @method
         *
         * @return {{
         *  toState: {Object} Target state object,
         *  toParams: {Object} Target state params,
         *  fromState: {Object} Source state object,
         *  fromParams: {Object} Source state params,
         *  options: {Object} Transition options,
         * }} Transition properties
         */
        function get() {
          return transitionProperties;
        }
      });
}());