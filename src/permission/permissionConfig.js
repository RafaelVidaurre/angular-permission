'use strict';

/**
 * Permission module configuration provider
 *
 * @name permission.permissionConfigProvider
 */
function permissionConfig() {
  'ngInject';

  var defaultOnAuthorizedMethod = 'showElement';
  var defaultOnUnauthorizedMethod = 'hideElement';

  /**
   * Methods allowing to alter default directive onAuthorized behaviour in permission directive
   *
   * @param onAuthorizedMethod {String} One of permission.PermPermissionStrategies method names
   */
  this.setDefaultOnAuthorizedMethod = function (onAuthorizedMethod) { // jshint ignore:line
    defaultOnAuthorizedMethod = onAuthorizedMethod;
  };

  /**
   * Methods allowing to alter default directive onUnauthorized behaviour in permission directive
   *
   * @param onUnauthorizedMethod {String} One of permission.PermPermissionStrategies method names
   */
  this.setDefaultOnUnauthorizedMethod = function (onUnauthorizedMethod) { // jshint ignore:line
    defaultOnUnauthorizedMethod = onUnauthorizedMethod;
  };


  this.$get = function () {   // jshint ignore:line
    return {
      defaultOnAuthorizedMethod: defaultOnAuthorizedMethod,
      defaultOnUnauthorizedMethod: defaultOnUnauthorizedMethod
    };
  };
}

angular
  .module('permission')
  .provider('permissionConfig', permissionConfig);