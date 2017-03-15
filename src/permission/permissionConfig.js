'use strict';

/**
 * Permission module configuration provider
 *
 * @name permission.permissionConfigProvider
 */
function permissionConfig() {
  'ngInject';

  this.defaultOnAuthorizedMethod = 'showElement';
  this.defaultOnUnauthorizedMethod = 'hideElement';

  /**
   * Methods allowing to alter default directive onAuthorized behaviour in permission directive
   *
   * @param onAuthorizedMethod {String} One of permission.PermPermissionStrategies method names
   */
  this.setDefaultOnAuthorizedMethod = function (onAuthorizedMethod) {
    this.defaultOnAuthorizedMethod = onAuthorizedMethod;
  };

  /**
   * Methods allowing to alter default directive onUnauthorized behaviour in permission directive
   *
   * @param onUnauthorizedMethod {String} One of permission.PermPermissionStrategies method names
   */
  this.setDefaultOnUnauthorizedMethod = function (onUnauthorizedMethod) {
    this.defaultOnUnauthorizedMethod = onUnauthorizedMethod;
  };

  this.$get = function () {
    return this;
  }
}

angular
  .module('permission')
  .provider('permissionConfig', permissionConfig);