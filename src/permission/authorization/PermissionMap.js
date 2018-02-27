'use strict';

/**
 * Access rights map factory
 * @name permission.PermPermissionMap
 *
 * @param $q {Object} Angular promise implementation
 * @param $log {Object} Angular logging utility
 * @param $injector {Object} Dependency injection instance
 * @param $permission {Object} Permission module configuration object
 * @param PermTransitionProperties {permission.PermTransitionProperties} Helper storing ui-router transition parameters
 * @param PermRoleStore {permission.PermRoleStore} Role definition storage
 * @param PermPermissionStore {permission.PermPermissionStore} Permission definition storage
 *
 * @return {permission.PermissionMap}
 */
function PermPermissionMap($q, $log, $injector, $permission, PermTransitionProperties, PermRoleStore, PermPermissionStore) {
  'ngInject';

  /**
   * Constructs map object instructing authorization service how to handle authorizing
   * @constructor permission.PermissionMap
   *
   * @param [permissionMap] {Object} Map of permissions provided to authorization service
   * @param [permissionMap.only] {String|Array|Function} List of exclusive access right names allowed for
   *   authorization
   * @param [permissionMap.except] {String|Array|Function} List of exclusive access right names denied for
   *   authorization
   * @param [permissionMap.redirectTo] {String|Function|Object|promise} Handling redirection when rejected
   *   authorization
   */
  function PermissionMap(permissionMap) {
    // Suppress not defined object errors
    permissionMap = permissionMap || {};

    this.only = normalizeOnlyAndExceptProperty(permissionMap.only);
    this.except = normalizeOnlyAndExceptProperty(permissionMap.except);
    this.redirectTo = normalizeRedirectToProperty(permissionMap.redirectTo);
  }

  /**
   * Redirects to fallback states when permissions fail
   * @methodOf permission.PermissionMap
   *
   * @param [rejectedPermissionName] {String} Permission name
   *
   * @return {Promise}
   */
  PermissionMap.prototype.resolveRedirectState = function (rejectedPermissionName) {

    // If redirectTo definition is not found stay where you are
    if (!angular.isDefined(this.redirectTo)) {
      return $q.reject();
    }

    var redirectState = this.redirectTo[rejectedPermissionName] || this.redirectTo['default'];

    return resolveRedirectState(redirectState, rejectedPermissionName);
  };

  /**
   * Resolves weather permissions set for "only" or "except" property are valid
   * @methodOf permission.PermissionMap
   *
   * @param property {Array} "only" or "except" map property
   *
   * @return {Array<Promise>}
   */
  PermissionMap.prototype.resolvePropertyValidity = function (property,options) {

    return property.map(function (privilegeName) {
      if (PermRoleStore.hasRoleDefinition(privilegeName)) {
        var role = PermRoleStore.getRoleDefinition(privilegeName);
        return role.validateRole(options);
      }

      if (PermPermissionStore.hasPermissionDefinition(privilegeName)) {
        var permission = PermPermissionStore.getPermissionDefinition(privilegeName);
        return permission.validatePermission(options);
      }

      if (!$permission.suppressUndefinedPermissionWarning) {
        $log.warn('Permission or role ' + privilegeName + ' was not defined.');
      }
      return $q.reject(privilegeName);
    });
  };

  /**
   * Handles function based redirection for rejected permissions
   * @methodOf permission.PermissionMap
   *
   * @throws {TypeError}
   *
   * @param redirectFunction {Function} Redirection function
   * @param rejectedPermissionName {String} Rejected permission
   *
   * @return {Promise}
   */
  function resolveRedirectState(redirectFunction, rejectedPermissionName) {
    return $q
      .when($injector.invoke(redirectFunction, null, {
        rejectedPermission: rejectedPermissionName,
        transitionProperties: PermTransitionProperties
      }))
      .then(function (redirectState) {
        if (angular.isString(redirectState)) {
          return {
            state: redirectState
          };
        }

        if (angular.isObject(redirectState)) {
          return redirectState;
        }

        return $q.reject();
      });
  }

  /**
   * Handles extraction of permission map "only" and "except" properties and converts them into array objects
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param property {String|Array|Function} PermPermission map property "only" or "except"
   *
   * @returns {Array<String>} Array of permission "only" or "except" names
   */
  function normalizeOnlyAndExceptProperty(property) {
    if (angular.isString(property)) {
      return [property];
    }

    if (angular.isArray(property)) {
      return property;
    }

    if (angular.isFunction(property)) {
      return property.call(null, PermTransitionProperties);
    }

    return [];
  }

  /**
   * Convert user provided input into key value dictionary with permission/role name as a key and injectable resolver
   * function as a value
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param redirectTo {String|Function|Array|Object} PermPermission map property "redirectTo"
   *
   * @returns {Object<String, Object>} Redirection dictionary object
   */
  function normalizeRedirectToProperty(redirectTo) {
    if (!angular.isDefined(redirectTo)) {
      return;
    }

    if (isInjectable(redirectTo) || angular.isFunction(redirectTo)) {
      return normalizeFunctionRedirectionRule(redirectTo);
    }

    if (angular.isObject(redirectTo)) {
      if (isObjectSingleRedirectionRule(redirectTo)) {
        return normalizeObjectSingleRedirectionRule(redirectTo);
      }

      return normalizeObjectMultipleRedirectionRule(redirectTo);
    }

    if (angular.isString(redirectTo)) {
      return normalizeStringRedirectionRule(redirectTo);
    }

    throw new ReferenceError('Property "redirectTo" must be String, Function, Array or Object');
  }

  /**
   * Convert string redirection rule into single-element redirection dictionary
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param redirectTo {String} PermPermission map property "redirectTo"
   *
   * @returns {Object<String, Object>} Redirection dictionary object
   */
  function normalizeStringRedirectionRule(redirectTo) {
    var redirectionMap = {};

    redirectionMap.default = function () {
      return {state: redirectTo};
    };
    redirectionMap.default.$inject = ['rejectedPermission', 'transitionProperties'];

    return redirectionMap;
  }

  /**
   * Checks if redirection object is single rule type
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param redirectTo {Object} PermPermission map property "redirectTo"
   *
   * @returns {boolean}
   */
  function isObjectSingleRedirectionRule(redirectTo) {
    return angular.isDefined(redirectTo.state);
  }

  /**
   * Convert single redirection rule object into single-element redirection dictionary
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param redirectTo {Object} PermPermission map property "redirectTo"
   *
   * @returns {Object<String, Object>} Redirection dictionary object
   */
  function normalizeObjectSingleRedirectionRule(redirectTo) {
    var redirectionMap = {};

    redirectionMap.default = function () {
      return redirectTo;
    };

    return redirectionMap;
  }

  /**
   * Convert multiple redirection rule object into redirection dictionary
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param redirectTo {Object} PermPermission map property "redirectTo"
   *
   * @returns {Object<String, Object>} Redirection dictionary object
   */
  function normalizeObjectMultipleRedirectionRule(redirectTo) {
    var redirectionMap = {};

    angular.forEach(redirectTo, function (redirection, permission) {
      if (isInjectable(redirection)) {
        redirectionMap[permission] = redirection;
      } else {
        if (angular.isFunction(redirection)) {
          redirectionMap[permission] = redirection;
          redirectionMap[permission].$inject = [];
        }
      }

      if (angular.isObject(redirection)) {
        redirectionMap[permission] = function () {
          return redirection;
        };
        redirectionMap[permission].$inject = [];
      }

      if (angular.isString(redirection)) {
        redirectionMap[permission] = function () {
          return {state: redirection};
        };
        redirectionMap[permission].$inject = [];
      }
    });

    return redirectionMap;
  }

  /**
   * Checks if property is injectable
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param property {Array|Object}
   *
   * @returns {boolean}
   */
  function isInjectable(property) {
    return angular.isArray(property) || (angular.isFunction(property) && angular.isArray(property.$inject));
  }

  /**
   * Convert function redirection rule into redirection dictionary
   * @methodOf permission.PermissionMap
   * @private
   *
   * @param redirectTo {Function} PermPermission map property "redirectTo"
   *
   * @returns {Object<String, Object>} Redirection dictionary object
   */
  function normalizeFunctionRedirectionRule(redirectTo) {
    var redirectionMap = {};

    redirectionMap.default = redirectTo;

    if (!angular.isDefined(redirectTo.$inject)) {
      redirectionMap.default.$inject = ['rejectedPermission', 'transitionProperties'];
    }

    return redirectionMap;
  }

  return PermissionMap;
}

angular
  .module('permission')
  .factory('PermPermissionMap', PermPermissionMap);
