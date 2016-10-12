describe('permission', function () {
  'use strict';

  describe('models', function () {
    describe('factory: PermPermission', function () {

      var $q;
      var PermPermission;
      var PermTransitionProperties;

      beforeEach(function () {
        module('permission');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          $q = $injector.get('$q');
          PermPermission = $injector.get('PermPermission');
          PermTransitionProperties = $injector.get('PermTransitionProperties');
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
          }).toThrow(new TypeError('Parameter "validationFunction" must be Function or an injectable Function using explicit annotation'));
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
          expect(permission.validationFunction).toBeDefined();
        });
      });

      describe('method: validatePermission', function () {
        it('should inject validation function and return results in promise', function () {
          var permissionName = 'USER';
          var validationFunction = jasmine.createSpy('validationFunction')
              .and.callFake(function () {
                return $q.resolve();
              });
          var injectableValidationFunction = ['$q', 'transitionProperties', 'PermPermission', 'permissionName', validationFunction];
          var permission = new PermPermission(permissionName, injectableValidationFunction);

          // WHEN
          var validationResult = permission.validatePermission();

          // THEN
          expect(validationFunction).toHaveBeenCalledWith($q, PermTransitionProperties, PermPermission, permissionName);
          expect(validationResult).toBePromise();
          expect(validationResult).toBeResolved();
        });

        it('should call validation function directly and return results in promise', function () {
          var permissionName = 'USER';
          var validationFunction = jasmine.createSpy('validationFunction')
            .and.callFake(function () {
              return $q.resolve();
            });
          var permission = new PermPermission(permissionName, validationFunction);

          // WHEN
          var validationResult = permission.validatePermission();

          // THEN
          expect(validationFunction).toHaveBeenCalledWith(permissionName, PermTransitionProperties);
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
          expect(validationFunction).toHaveBeenCalledWith(permissionName, PermTransitionProperties);
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
          expect(validationFunction).toHaveBeenCalledWith(permissionName, PermTransitionProperties);
          expect(validationResult).toBePromise();
          expect(validationResult).toBeRejected();
        });
      });
    });
  });
});