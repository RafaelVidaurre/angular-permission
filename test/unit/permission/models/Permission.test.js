describe('permission', function () {
  'use strict';

  describe('models', function () {
    describe('factory: PermPermission', function () {

      var $q;
      var PermPermission;

      beforeEach(function () {
        module('permission');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          $q = $injector.get('$q');
          PermPermission = $injector.get('PermPermission');
        });
      });

      describe('constructor: PermPermission', function () {
        it('should throw an exception on invalid permissionName', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(function () {
            new PermPermission(null, function () {
              return true;
            });
          }).toThrow(new TypeError('Parameter "permissionName" name must be String'));
        });

        it('should throw an exception on invalid validationFunction', function () {
          // GIVEN
          // WHEN
          // THEN
          expect(function () {
            new PermPermission('valid-name', undefined);
          }).toThrow(new TypeError('Parameter "validationFunction" must be Function'));
        });

        it('should return new permission definition instance for correct parameters', function () {
          // GIVEN
          var permissionName = 'USER';
          var validationFunction = function () {
            return true;
          };

          // WHEN
          var permission = new PermPermission(permissionName, validationFunction);

          // THEN
          expect(permission.permissionName).toBe(permissionName);
          expect(permission.validationFunction).toBe(validationFunction);
        });
      });

      describe('method: validatePermission', function () {
        it('should call validation function and return results in promise', function () {
          var permissionName = 'USER';
          var validationFunction = jasmine.createSpy('validationFunction')
            .and.callFake(function () {
              return $q.resolve();
            });
          var permission = new PermPermission(permissionName, validationFunction);

          // WHEN
          var validationResult = permission.validatePermission();

          // THEN
          expect(validationFunction).toHaveBeenCalledWith(permissionName, jasmine.any(Object));
          expect(validationResult).toBePromise();
          expect(validationResult).toBeResolved();
        });

        it('should wrap validation function result into resolved promise returns true boolean value', function () {
          var permissionName = 'USER';
          var validationFunction = jasmine.createSpy('validationFunction')
            .and.callFake(function () {
              return true;
            });
          var permission = new PermPermission(permissionName, validationFunction);

          // WHEN
          var validationResult = permission.validatePermission();

          // THEN
          expect(validationFunction).toHaveBeenCalledWith(permissionName, jasmine.any(Object));
          expect(validationResult).toBePromise();
          expect(validationResult).toBeResolved();
        });

        it('should wrap validation function result into rejected promise returns false boolean value', function () {
          var permissionName = 'USER';
          var validationFunction = jasmine.createSpy('validationFunction')
            .and.callFake(function () {
              return false;
            });
          var permission = new PermPermission(permissionName, validationFunction);

          // WHEN
          var validationResult = permission.validatePermission();

          // THEN
          expect(validationFunction).toHaveBeenCalledWith(permissionName, jasmine.any(Object));
          expect(validationResult).toBePromise();
          expect(validationResult).toBeRejected();
        });
      });
    });
  });
});