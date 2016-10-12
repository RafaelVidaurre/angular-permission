describe('permission', function () {
  'use strict';

  describe('models', function () {
    describe('factory: PermRole', function () {

      var PermRole;
      var PermPermissionStore;
      var PermTransitionProperties;

      beforeEach(function () {
        module('permission');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          PermRole = $injector.get('PermRole');
          PermPermissionStore = $injector.get('PermPermissionStore');
          PermTransitionProperties = $injector.get('PermTransitionProperties');
        });
      });

      describe('constructor: PermRole', function () {
        it('should throw an exception on invalid roleName', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(function () {
            new PermRole(null, function () {
              return true;
            });
          }).toThrow(new TypeError('Parameter "roleName" name must be String'));
        });

        it('should throw an exception on invalid validationFunction', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(function () {
            new PermRole('valid-name', undefined);
          }).toThrow(new TypeError('Parameter "validationFunction" must be array or function'));
        });

        it('should return new role definition instance for correct parameters', function () {
          // GIVEN
          var permissionName = 'ACCOUNTANT';
          var permissionNames = ['USER'];

          // WHEN
          var role = new PermRole(permissionName, permissionNames);

          // THEN
          expect(role.roleName).toBe(permissionName);
          expect(role.validationFunction).toBeDefined();
        });
      });

      describe('method: validateRole', function () {
        it('should inject validationFunction when no permissions were provided', function () {
          // GIVEN
          var validationFunction = jasmine.createSpy('validationFunction').and.callFake(function () {
            return true;
          });
          var injectableValidationFunction = ['PermRole', 'transitionProperties', 'PermPermissionStore', 'roleName', validationFunction];
          var role = new PermRole('ACCOUNTANT', injectableValidationFunction);

          // WHEN
          role.validateRole();

          // THEN
          expect(validationFunction).toHaveBeenCalledWith(PermRole, PermTransitionProperties, PermPermissionStore, role.roleName);
        });

        it('should call directly validationFunction when no permissions were provided', function () {
          // GIVEN
          var validationFunction = jasmine.createSpy('validationFunction').and.callFake(function () {
            return true;
          });
          var role = new PermRole('ACCOUNTANT', validationFunction);


          // WHEN
          role.validateRole();

          // THEN
          expect(validationFunction).toHaveBeenCalled();
        });

        it('should call validationFunction through permission definitions when provided', function () {
          // GIVEN
          var validationFunction = jasmine.createSpy('validationFunction').and.callFake(function () {
            return true;
          });
          PermPermissionStore.definePermission('USER', validationFunction);
          var role = new PermRole('ACCOUNTANT', ['USER']);

          // WHEN
          role.validateRole();

          // THEN
          expect(validationFunction).toHaveBeenCalled();
        });


        it('should wrap validation function result into resolved promise when returns true boolean value', function () {
          var roleName = 'ACCOUNTANT';
          var validationFunction = jasmine.createSpy('validationFunction')
            .and.callFake(function () {
              return true;
            });
          var permission = new PermRole(roleName, validationFunction);

          // WHEN
          var validationResult = permission.validateRole();

          // THEN
          expect(validationFunction).toHaveBeenCalledWith(roleName, PermTransitionProperties);
          expect(validationResult).toBePromise();
          expect(validationResult).toBeResolved();
        });

        it('should wrap validation function result into rejected promise when returns false boolean value', function () {
          var permissionName = 'ACCOUNTANT';
          var validationFunction = jasmine.createSpy('validationFunction')
            .and.callFake(function () {
              return false;
            });
          var permission = new PermRole(permissionName, validationFunction);

          // WHEN
          var validationResult = permission.validateRole();

          // THEN
          expect(validationFunction).toHaveBeenCalledWith(permissionName, PermTransitionProperties);
          expect(validationResult).toBePromise();
          expect(validationResult).toBeRejected();
        });

        it('should return rejected promise when at least one of permissions is not defined', function () {
          // GIVEN
          var role = new PermRole('ACCOUNTANT', ['FAKE']);

          // WHEN
          var validationResult = role.validateRole();

          // THEN
          expect(validationResult).toBePromise();
          expect(validationResult).toBeRejected();
        });

        it('should throw error when could not validate role', function () {
          // GIVEN
          var role = new PermRole('ACCOUNTANT', [{}]);

          // WHEN
          // THEN
          var validationResult = role.validateRole();

          expect(validationResult).toBePromise();
          expect(validationResult).toBeRejected();
        });
      });
    });
  });
});