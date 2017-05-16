'use strict';

/**
 * Permission module configuration provider
 *
 * @name permission.permissionProvider
 */
function $permission() {
  'ngInject';

  var defaultOnAuthorizedMethod = 'showElement';
  var defaultOnUnauthorizedMethod = 'hideElement';
  var suppressUndefinedPermissionWarning = false;

  /**
   * Methods allowing to alter default directive onAuthorized behaviour in permission directive
   * @methodOf permission.permissionProvider
   *
   * @param onAuthorizedMethod {String} One of permission.PermPermissionStrategies method names
   */
  this.setDefaultOnAuthorizedMethod = function (onAuthorizedMethod) { // jshint ignore:line
    defaultOnAuthorizedMethod = onAuthorizedMethod;
  };

  /**
   * Methods allowing to alter default directive onUnauthorized behaviour in permission directive
   * @methodOf permission.permissionProvider
   *
   * @param onUnauthorizedMethod {String} One of permission.PermPermissionStrategies method names
   */
  this.setDefaultOnUnauthorizedMethod = function (onUnauthorizedMethod) { // jshint ignore:line
    defaultOnUnauthorizedMethod = onUnauthorizedMethod;
  };


  /**
   * When set to true hides permission warning for undefined roles and permissions
   * @methodOf permission.permissionProvider
   *
   * @param value {Boolean}
   */
  this.suppressUndefinedPermissionWarning = function (value) { // jshint ignore:line
    suppressUndefinedPermissionWarning = value;
  };


  this.$get = function () {   // jshint ignore:line
    return {
      defaultOnAuthorizedMethod: defaultOnAuthorizedMethod,
      defaultOnUnauthorizedMethod: defaultOnUnauthorizedMethod,
      suppressUndefinedPermissionWarning: suppressUndefinedPermissionWarning
    };
  };
}

angular
  .module('permission')
  .provider('$permission', $permission);