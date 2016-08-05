'use strict';

/**
 * Helper object used for storing ui-router/ng-route transition parameters
 * @name permission.PermTransitionProperties
 *
 * @type {Object.<String,Object>}
 *
 * Transition properties for ui-router:
 * @property toState {Object} Target state object [ui-router]
 * @property toParams {Object} Target state params [ui-router]
 * @property fromState {Object} Source state object [ui-router]
 * @property fromParams {Object} Source state params [ui-router]
 * @property options {Object} Transition options [ui-router]
 *
 * Transition properties for ng-route:
 * @property current {Object} Current state properties [ng-route]
 * @property next {Object} Next state properties [ng-route]
 */
var PermTransitionProperties = {};

angular
  .module('permission')
  .value('PermTransitionProperties', PermTransitionProperties);