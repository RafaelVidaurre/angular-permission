describe('permission', function () {
  'use strict';

  describe('configuration', function () {
    describe('provider: permissionConfig', function () {
      var permissionConfigProvider;

      beforeEach(function () {
        module('permission');
      });

      beforeEach(function () {
        module(['permissionConfigProvider', function (_permissionConfigProvider) {
          permissionConfigProvider = _permissionConfigProvider;
        }]);
      });

      beforeEach(inject());

      describe('method: setDefaultOnAuthorizedMethod', function () {
        it('should have default authorized method set to showElement', function () {
          // GIVEN
          // WHEN
          //THEN
          expect(permissionConfigProvider.$get().defaultOnAuthorizedMethod).toBe('showElement');
        });

        it('should set custom default authorized method when provided', function () {
          // GIVEN
          var onAuthorizedMethodName = 'customOnAuthorizedMethod';

          // WHEN
          permissionConfigProvider.setDefaultOnAuthorizedMethod(onAuthorizedMethodName);

          //THEN
          expect(permissionConfigProvider.$get().defaultOnAuthorizedMethod).toBe(onAuthorizedMethodName);
        });
      });

      describe('method: setDefaultOnUnauthorizedMethod', function () {
        it('should have default unauthorized method set to hideElement', function () {
          // GIVEN
          // WHEN
          //THEN
          expect(permissionConfigProvider.$get().defaultOnUnauthorizedMethod).toBe('hideElement');
        });

        it('should set custom default unauthorized method when provided', function () {
          // GIVEN
          var onUnauthorizedMethodName = 'customOnUnauthorizedMethod';

          // WHEN
          permissionConfigProvider.setDefaultOnUnauthorizedMethod(onUnauthorizedMethodName);

          //defaultOnUnauthorizedMethod
          expect(permissionConfigProvider.$get().defaultOnUnauthorizedMethod).toBe(onUnauthorizedMethodName);
        });
      });
    });
  });
});