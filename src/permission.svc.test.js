describe('Service: Permission', function () {
  'use strict';

  var Permission;
  var $q;
  var $rootScope;
  var PermissionProvider;
  var EXCEPTIONS = {
    DEFINE_ROLE_EXCEPTION: new Error('Role name must be a string'),
    DEFINE_MANY_ROLES_EXCEPTION: new Error('Roles must be an array')
  };

  // Helpers
  var resolveHelper, rejectHelper, defineProviderRolesHelper, defineRolesHelper;
  beforeEach(function () {
    var user = {role: 'admin'};

    resolveHelper = function () {
      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
    };
    rejectHelper = function () {
      var deferred = $q.defer();
      deferred.reject();
      return deferred.promise;
    };
    defineProviderRolesHelper = function () {
      PermissionProvider.defineRole('anonymous', function () {
        var deferred = $q.defer();
        if (!user) {
          deferred.resolve();
        } else {
          deferred.reject();
        }
        return deferred.promise;
      });
      PermissionProvider.defineRole('user', function () {
        var deferred = $q.defer();
        if (user) {
          deferred.resolve();
        } else {
          deferred.reject();
        }
        return deferred.promise;
      });
      PermissionProvider.defineRole('admin', function () {
        var deferred = $q.defer();
        if (user && user.role === 'admin') {
          deferred.resolve();
        } else {
          deferred.reject();
        }
        return deferred.promise;
      });
    };
    defineRolesHelper = function () {
      Permission.defineRole('anonymous', function () {
        var deferred = $q.defer();
        if (!user) {
          deferred.resolve();
        } else {
          deferred.reject();
        }
        return deferred.promise;
      });
      Permission.defineRole('user', function () {
        var deferred = $q.defer();
        if (user) {
          deferred.resolve();
        } else {
          deferred.reject();
        }
        return deferred.promise;
      });
      Permission.defineRole('admin', function () {
        var deferred = $q.defer();
        if (user && user.role === 'admin') {
          deferred.resolve();
        } else {
          deferred.reject();
        }
        return deferred.promise;
      });
    };
  });

  beforeEach(module('permission', function (_PermissionProvider_) {
    PermissionProvider = _PermissionProvider_;
  }));

  beforeEach(inject(function(_Permission_, _$q_, _$rootScope_) {
    Permission = _Permission_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  describe('PermissionProvider', function () {
    describe('#defineRole (provider version)', function () {

      it('should throw an exception on invalid role name', function () {
        expect(function () {
          PermissionProvider.defineRole(123, function () {});
        }).toThrow(EXCEPTIONS.DEFINE_ROLE_EXCEPTION);

        expect(function () {
          PermissionProvider.defineRole(null, function () {});
        }).toThrow(EXCEPTIONS.DEFINE_ROLE_EXCEPTION);
      });

      it('should not throw an exception on valid role name', function () {
        PermissionProvider.defineRole('valid-name', function () {});
      });

      it('should set a role validation method to the key defined', function () {
        var CustomPermission;

        defineProviderRolesHelper();

        inject(function(_Permission_) {
          CustomPermission = _Permission_;
        });

        expect(angular.isFunction(CustomPermission.roleValidations.anonymous)).toBe(true);
        expect(angular.isFunction(CustomPermission.roleValidations.user)).toBe(true);
        expect(angular.isFunction(CustomPermission.roleValidations.admin)).toBe(true);
      });

    });

    describe('#defineManyRoles (provider version)', function () {

      it('should throw an exception on invalid role name', function () {
          expect(function () {
            Permission.defineManyRoles(123, function () {});
          }).toThrow(EXCEPTIONS.DEFINE_MANY_ROLES_EXCEPTION)

          expect(function () {
            Permission.defineManyRoles(null, function () {});
          }).toThrow(EXCEPTIONS.DEFINE_MANY_ROLES_EXCEPTION)

          expect(function () {
            Permission.defineManyRoles('admin', function () {});
          }).toThrow(EXCEPTIONS.DEFINE_MANY_ROLES_EXCEPTION)

          expect(function () {
            Permission.defineManyRoles(['admin', 1], function () {});
          }).toThrow(EXCEPTIONS.DEFINE_ROLE_EXCEPTION)
      });

      it('should not throw an exception on valid role name', function () {
          Permission.defineManyRoles(['admin', 'publisher'], function () {});
      });

    });


  });

  describe('#defineRole', function () {
    it('should define roles on run stage', function () {
      var fakeService = {
        age: 12,
        wise: true,
        evenAge: function () {return this.age % 2 === 0;}
      };
      Permission.defineRole('noob', function () {
        var deferred = $q.defer();
        fakeService.wise ? deferred.reject() : deferred.resolve();
        return deferred.promise;
      });
      Permission.defineRole('pair', function () {
        var deferred = $q.defer();
        fakeService.evenAge ? deferred.resolve() : deferred.reject();
        return deferred.promise;
      });
      expect(angular.isFunction(Permission.roleValidations.noob)).toBe(true);
      expect(angular.isFunction(Permission.roleValidations.pair)).toBe(true);
    });
  });

  describe('#defineManyRoles', function () {

    it('should define many roles on run stage', function () {
     var systemRoles = ['admin', 'publisher', 'user', 'anonymous'];
     var userRoles = ['publisher', 'user'];

      Permission.defineManyRoles(systemRoles, function(stateParams, role){
          var deferred = $q.defer();
          var userHasRole = (userRoles.indexOf(role) != -1);
          userHasRole ?  deferred.resolve() : deferred.reject();
          return deferred.promise;
      });

      expect(angular.isFunction(Permission.roleValidations.admin)).toBe(true);
      expect(angular.isFunction(Permission.roleValidations.publisher)).toBe(true);
      expect(angular.isFunction(Permission.roleValidations.user)).toBe(true);
      expect(angular.isFunction(Permission.roleValidations.anonymous)).toBe(true);

    });

  });

  describe('#_validateRoleMap', function () {
    it('should throw exception if param isn\'t an object', function () {
      var exception = new Error('Role map has to be an object');
      expect(function () {
        Permission._validateRoleMap([1, 2]);
      }).toThrow(exception);
      expect(function () {
        Permission._validateRoleMap('string');
      }).toThrow(exception);
      expect(function () {
        Permission._validateRoleMap(123);
      }).toThrow(exception);
      expect(function () {
        Permission._validateRoleMap();
      }).toThrow(exception);
    });

    it('should throw an exception if param doesn\'t have "only" or "except" keys', function () {
      var exception = new Error('Either "only" or "except" keys must me defined');
      expect(function () {
        Permission._validateRoleMap({});
      }).toThrow(exception);
      expect(function () {
        Permission._validateRoleMap({foo: ['a']});
      }).toThrow(exception);
    });

    it('should throw an exception if only or except keys are not arrays', function () {
      var exception = new Error('Array of roles expected');

      expect(function () {
        Permission._validateRoleMap({
          only: 'a'
        });
      }).toThrow(exception);

      expect(function () {
        Permission._validateRoleMap({
          only: 123
        });
      }).toThrow(exception);
    });

  });

  describe('#authorize', function () {
    it('should be a function', function () {
      expect(Permission.authorize).toBeDefined();
    });

    it('should call _authorizeOnly if "only" key is defined', function () {
      spyOn(Permission, 'resolveIfMatch');
      spyOn(Permission, 'rejectIfMatch');

      Permission.authorize({
        only: ['a', 'b']
      });

      expect(Permission.resolveIfMatch).toHaveBeenCalled();
      expect(Permission.rejectIfMatch).not.toHaveBeenCalled();
    });

    it('should call _authorizeExcept if "except" key is defined', function () {
      spyOn(Permission, 'resolveIfMatch');
      spyOn(Permission, 'rejectIfMatch');

      Permission.authorize({
        except: ['a', 'b']
      });

      expect(Permission.rejectIfMatch).toHaveBeenCalled();
      expect(Permission.resolveIfMatch).not.toHaveBeenCalled();
    });

    it('should call "only" if both keys are defined', function () {
      spyOn(Permission, 'resolveIfMatch');
      spyOn(Permission, 'rejectIfMatch');

      Permission.authorize({
        only: ['a', 'b'],
        except: ['c', 'd']
      });

      expect(Permission.resolveIfMatch).toHaveBeenCalled();
      expect(Permission.rejectIfMatch).not.toHaveBeenCalled();
    });
  });

  describe('#rejectIfMatch', function () {
    beforeEach(function () {defineRolesHelper();});

    it('should reject if a role is matched', function () {
      var callbacks = {reject: function () {}, resolve: function () {}};
      spyOn(callbacks, 'reject');
      spyOn(callbacks, 'resolve');

      Permission.rejectIfMatch(['admin']).then(callbacks.resolve, callbacks.reject);
      $rootScope.$digest();

      expect(callbacks.resolve).not.toHaveBeenCalled();
      expect(callbacks.reject).toHaveBeenCalled();
    });

    it('should resolve if no role is matched', function () {
      var callbacks = {reject: function () {}, resolve: function () {}};
      spyOn(callbacks, 'reject');
      spyOn(callbacks, 'resolve');

      Permission.rejectIfMatch(['anonymous']).then(callbacks.resolve, callbacks.reject);
      $rootScope.$digest();

      expect(callbacks.resolve).toHaveBeenCalled();
      expect(callbacks.reject).not.toHaveBeenCalled();
    });
  });

  describe('#resolveIfMatch', function () {
    beforeEach(function () {defineRolesHelper();});

    it('should resolve if a role is matched', function () {
      var callbacks = {reject: function () {}, resolve: function () {}};
      spyOn(callbacks, 'reject');
      spyOn(callbacks, 'resolve');

      Permission.resolveIfMatch(['admin']).then(callbacks.resolve, callbacks.reject);
      $rootScope.$digest();

      expect(callbacks.resolve).toHaveBeenCalled();
      expect(callbacks.reject).not.toHaveBeenCalled();
    });

    it('should reject if no role is matched', function () {
      var callbacks = {reject: function () {}, resolve: function () {}};
      spyOn(callbacks, 'reject');
      spyOn(callbacks, 'resolve');

      Permission.resolveIfMatch(['anonymous']).then(callbacks.resolve, callbacks.reject);
      $rootScope.$digest();

      expect(callbacks.reject).toHaveBeenCalled();
      expect(callbacks.resolve).not.toHaveBeenCalled();
    });
  });
});
