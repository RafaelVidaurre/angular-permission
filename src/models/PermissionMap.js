(function () {
  'use strict';

  angular
    .module('permission')
    .factory('PermissionMap', function ($q, $parse) {

      /**
       * Constructs map object instructing authorization service how to handle authorizing
       *
       * @param permissionMap {Object} Map of permissions provided to authorization service
       * @param permissionMap.only {Array} List of exclusive permission/role names allowed for authorization
       * @param permissionMap.except {Array} List of exclusive permission/role names denied for authorization
       * @param permissionMap.redirectTo {String|Function|Object|promise} Handling redirection when rejected
       *   authorization
       * @param [toState] {Object} UI-Router transition state object
       * @param [toParams] {Object} UI-Router transition state params
       * @param [options] {Object} UI-Router transition state options
       * @constructor
       */
      function PermissionMap(permissionMap, toState, toParams, options) {
        this.only = resolvePermissionMapProperty(permissionMap.only, toState, toParams, options);
        this.except = resolvePermissionMapProperty(permissionMap.except, toState, toParams, options);
        this.redirectTo = permissionMap.redirectTo;
      }

      /**
       * Extends permission map by pushing to it state's permissions
       *
       * @param permissionMap {PermissionMap} Compensated permission map
       */
      PermissionMap.prototype.extendPermissionMap = function (permissionMap) {
        this.only = this.only.concat(permissionMap.only);
        this.except = this.except.concat(permissionMap.except);
      };

      /**
       * Redirects to fallback states when permissions fail
       *
       * @param rejectedPermissionName {String} Permission name
       *
       * @return {Promise}
       */
      PermissionMap.prototype.resolveRedirectState = function (rejectedPermissionName) {
        if (angular.isFunction(this.redirectTo)) {
          return resolveFunctionRedirect(this.redirectTo, rejectedPermissionName);
        }

        if (angular.isObject(this.redirectTo)) {
          return resolveObjectRedirect(this.redirectTo, rejectedPermissionName);
        }

        if (angular.isString(this.redirectTo)) {
          return $q.resolve(parseStateRef(this.redirectTo));
        }

        // If redirectTo state is not defined stay where you are
        return $q.reject(null);
      };

      /**
       * Handles function based redirection for rejected permissions
       *
       * @param redirectFunction {Function} Redirection function
       * @param permission {String} Rejected permission
       *
       * @return {Promise}
       */
      function resolveFunctionRedirect(redirectFunction, permission) {
        return $q
          .when(redirectFunction.call(null, permission))
          .then(function (redirectState) {
            if (!angular.isString(redirectState)) {
              throw new TypeError('When used "redirectTo" as function, returned value must be string with state name');
            }
            return parseStateRef(redirectState);
          });
      }

      /**
       * Handles object based redirection for rejected permissions
       *
       * @param redirectObject {Object} Redirection function
       * @param permission {String} Rejected permission
       *
       * @return {Promise}
       */
      function resolveObjectRedirect(redirectObject, permission) {
        if (!angular.isDefined(redirectObject['default'])) {
          throw new ReferenceError('When used "redirectTo" as object, property "default" must be defined');
        }

        var redirectState = redirectObject[permission];

        if (!angular.isDefined(redirectState)) {
          redirectState = redirectObject['default'];
        }

        if (angular.isFunction(redirectState)) {
          return resolveFunctionRedirect(redirectState, permission);
        }

        if (angular.isString(redirectState)) {
          return $q.resolve(parseStateRef(redirectState));
        }
      }

      /**
       * Parse a stateRef expression like in ui-sref directive. The state is mandatory but stateParameters are optional.
       * @private
       *
       * @param sref
       * @returns {{to: String, params: (Object|null), options: (Object| null)}}
       */
      function parseStateRef(sref) {
        var parsed = sref.replace(/\n/g, ' ').match(/^([^(]+?)\s*(\((.*)\))?$/);
        if (!parsed || parsed.length !== 4){
          throw new SyntaxError('Invalid state ref \'' + sref + '\'');
        }

        var params = null;
        if(parsed[3]) {
          try {
            var getter = $parse(parsed[3]);
            params = getter();
          } catch(e) {
            throw new SyntaxError('Failed to parse state parameters');
          }
        }

        if(params !== null && !angular.isObject(params)) {
          throw new TypeError('State parameters must be an object');
        }

        return { to: parsed[1], params: params || null, options: null };
      }


      /**
       * Handles extraction of permission map "only" and "except" properties
       * @private
       *
       * @param property {Array|Function|promise} Permission map property "only" or "except"
       * @param [toState] {Object} UI-Router transition state object
       * @param [toParams] {Object} UI-Router transition state params
       * @param [options] {Object} UI-Router transition state options
       *
       * @returns {Array} Array of permission "only" or "except" names
       */
      function resolvePermissionMapProperty(property, toState, toParams, options) {
        if (angular.isString(property)) {
          return [property];
        }

        if (angular.isArray(property)) {
          return property;
        }

        if (angular.isFunction(property)) {
          return property.call(null, toState, toParams, options);
        }

        return [];
      }

      return PermissionMap;
    });
}());