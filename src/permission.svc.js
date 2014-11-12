(function () {
  'use strict';

  angular.module('permission')
    .provider('Permission', function () {
      var roleValidationConfig = {};
      var validateRoleDefinitionParams = function (roleName, validationFunction) {
        if (!angular.isString(roleName)) {
          throw new Error('Role name must be a string');
        }
        if (!angular.isFunction(validationFunction)) {
          throw new Error('Validation function not provided correctly');
        }
      };

      this.defineRole = function (roleName, validationFunction) {
        /**
          This method is only available in config-time, and cannot access services, as they are
          not yet injected anywere which makes this kinda useless.
          Should remove if we cannot find a use for it.
        **/
        validateRoleDefinitionParams(roleName, validationFunction);
        roleValidationConfig[roleName] = validationFunction;

        return this;
      };

      this.$get = ['$q', function ($q) {
        var Permission = {
          _promiseify: function (value) {
            /**
              Converts a value into a promise, if the value is truthy it resolves it, otherwise
              it rejects it
            **/
            if (value && angular.isFunction(value.then)) {
              return value;
            }

            var deferred = $q.defer();
            if (value) {
              deferred.resolve();
            } else {
              deferred.reject();
            }
            return deferred.promise;
          },
          _validateRoleMap: function (roleMap) {
            if (typeof(roleMap) !== 'object' || roleMap instanceof Array) {
              throw new Error('Role map has to be an object');
            }
            if (roleMap.only === undefined && roleMap.except === undefined && roleMap.all === undefined) {
              throw new Error('Either "only", "except" or "all" keys must me defined');
            }
            if (roleMap.only) {
              if (!(roleMap.only instanceof Array)) {
                throw new Error('Array of roles expected');
              }
            } else if (roleMap.except) {
              if (!(roleMap.except instanceof Array)) {
                throw new Error('Array of roles expected');
              }
            } else if(roleMap.all) {
              if(!(roleMap.all instanceof Array || angular.isObject(roleMap.all))) {
                throw new Error('Array/Object of roles expected');
              }
            }
          },
          _findMatchingRole: function (rolesArray, toParams) {
            var roles = angular.copy(rolesArray);
            var deferred = $q.defer();
            var currentRole = roles.shift();

            // If no roles left to validate reject promise
            if (!currentRole) {
              deferred.reject();
              return deferred.promise;
            }
            // Validate role definition exists
            if (!angular.isFunction(Permission.roleValidations[currentRole])) {
              throw new Error('undefined role or invalid role validation');
            }

            var validatingRole = Permission.roleValidations[currentRole](toParams);
            validatingRole = Permission._promiseify(validatingRole);

            validatingRole.then(function () {
              deferred.resolve();
            }, function () {
              Permission._findMatchingRole(roles, toParams).then(function () {
                deferred.resolve();
              }, function () {
                deferred.reject();
              });
            });

            return deferred.promise;
          },
          _checkIfAllRolesMatch: function (roles, toParams) {
            var deferred = $q.defer();
            var rolesArray = [];
            // private method for this function
            var promiseifyRole = function (role) {
                if (!angular.isFunction(Permission.roleValidations[role])) {
                  throw new Error('undefined role or invalid role validation');
                }

                return {
                  role: role,
                  promise: Permission._promiseify(Permission.roleValidations[role](toParams))
                };              
              };

            // if roles is an array just promiseify the roles one by one
            if(roles instanceof Array) {
              rolesArray = roles.map(function (role) {
                return promiseifyRole(role);
              });
            }             
            else if(angular.isObject(roles)) {
              for(var role in roles) {
                if(roles.hasOwnProperty(role)) {
                  rolesArray.push(promiseifyRole(role));
                }
              }
            }
            else {
              throw new Error('The roles have to be provided either as an Array or an Object');
            }

            // A solution with $q.all would have been more elegant. Sadly $q.all does not provide the information which promise has
            // been rejected. This implementation is very similar to $q.all
            var resolvedCounter = 0;
            angular.forEach(rolesArray, function(role) {
              resolvedCounter = resolvedCounter + 1;
              role.promise.then(
                function resolved () {
                  resolvedCounter = resolvedCounter - 1;
                  if(resolvedCounter === 0) {
                    deferred.resolve();
                  }
                },
                function rejected (reason) {
                  /**
                  * Keep in mind with this solution
                  * 1.  first check if the promise was rejected and if there is a redirectTo statement, resolve and provide the
                  *     redirectTo state if true
                  * 2.  otherwise check if the roles were provided via an object
                  *     check if a redirectTo was provided, resolve and provide the redirectTo state if true
                  * 3.  resolve without a redirectTo information otherwise. In this case the redirectTo state from the 
                  *     setting in the $stateProvider will be used if provided
                  */
                 
                  // if a reason was provided when calling reject and the reason object has a property redirectTo
                  if (reason && angular.isObject(reason) && reason.redirectTo) {
                    deferred.reject(reason);                    
                  } else {
                    // if the roles were provided in an object
                    if(angular.isObject(roles) && roles[role.role]) {
                      deferred.reject(roles[role.role]);
                    }
                    else {
                      deferred.reject();
                    }
                  }
                }
              );
            });

            if(resolvedCounter === 0) {
              deferred.resolve();
            }

            return deferred.promise;
          },

          defineRole: function (roleName, validationFunction) {
            /**
              Service-available version of defineRole, the callback passed here lives in the
              scope where it is defined and therefore can interact with other modules
            **/
            validateRoleDefinitionParams(roleName, validationFunction);
            roleValidationConfig[roleName] = validationFunction;

            return Permission;
          },
          resolveIfMatch: function (rolesArray, toParams) {
            var roles = angular.copy(rolesArray);
            var deferred = $q.defer();
            Permission._findMatchingRole(roles, toParams).then(function () {
              // Found role match
              deferred.resolve();
            }, function () {
              // No match
              deferred.reject();
            });
            return deferred.promise;
          },
          
          resolveIfAllMatch: function (rolesArray, toParams) {
            var roles = angular.copy(rolesArray);
            var deferred = $q.defer();

            Permission._checkIfAllRolesMatch(roles, toParams).then(
              function resolved () {
                deferred.resolve();
              },
              function rejected (rejection) {
                deferred.reject(rejection);
              }
            );
            return deferred.promise;
          },

          rejectIfMatch: function (roles, toParams) {
            var deferred = $q.defer();
            Permission._findMatchingRole(roles, toParams).then(function () {
              // Role found
              deferred.reject();
            }, function () {
              // Role not found
              deferred.resolve();
            });
            return deferred.promise;
          },
          roleValidations: roleValidationConfig,
          authorize: function (roleMap, toParams) {
            // Validate input
            Permission._validateRoleMap(roleMap);

            var authorizing;

            if (roleMap.only) {
              authorizing = Permission.resolveIfMatch(roleMap.only, toParams);
            } else if(roleMap.except) {
              authorizing = Permission.rejectIfMatch(roleMap.except, toParams);
            } else if(roleMap.all) {
              authorizing = Permission.resolveIfAllMatch(roleMap.all, toParams);
            }

            return authorizing;
          }
        };

        return Permission;
      }];
    });

}());
