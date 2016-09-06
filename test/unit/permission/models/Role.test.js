describe('permission', function () {
  'use strict';

  describe('models', function () {
    describe('factory: PermRole', function () {

      var PermRole;
      var PermPermissionStore;

      beforeEach(function () {
        module('permission');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          PermRole = $injector.get('PermRole');
          PermPermissionStore = $injector.get('PermPermissionStore');
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
          expect(role.validationFunction).toBe(permissionNames);
        });
      });

      describe('method: validateRole', function () {
        it('should call directly validationFunction when no permissions were provided', function () {
          // GIVEN
          var role = new PermRole('ACCOUNTANT', function () {
            return true;
          });
          spyOn(role, 'validationFunction').and.callThrough();

          // WHEN
          role.validateRole();

          // THEN
          expect(role.validationFunction).toHaveBeenCalled();
        });

        it('should call validationFunction through permission definitions when provided', function () {
          // GIVEN
          PermPermissionStore.definePermission('USER', function () {
            return true;
          });
          var role = new PermRole('ACCOUNTANT', ['USER']);
          var userDefinition = PermPermissionStore.getPermissionDefinition('USER');
          spyOn(userDefinition, 'validationFunction').and.callThrough();

          // WHEN
          role.validateRole();

          // THEN
          expect(userDefinition.validationFunction).toHaveBeenCalled();
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
          expect(validationFunction).toHaveBeenCalledWith(roleName, jasmine.any(Object));
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
          expect(validationFunction).toHaveBeenCalledWith(permissionName, jasmine.any(Object));
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