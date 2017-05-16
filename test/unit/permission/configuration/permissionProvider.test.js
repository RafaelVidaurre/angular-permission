describe('permission', function () {
  'use strict';

  describe('configuration', function () {
    describe('provider: $permission', function () {
      var $permissionProvider;

      beforeEach(function () {
        module('permission');
      });

      beforeEach(function () {
        module(['$permissionProvider', function (_permissionProvider) {
          $permissionProvider = _permissionProvider;
        }]);
      });

      beforeEach(inject());

      describe('method: setDefaultOnAuthorizedMethod', function () {
        it('should have default authorized method set to showElement', function () {
          // GIVEN
          // WHEN
          //THEN
          expect($permissionProvider.$get().defaultOnAuthorizedMethod).toBe('showElement');
        });

        it('should set custom default authorized method when provided', function () {
          // GIVEN
          var onAuthorizedMethodName = 'customOnAuthorizedMethod';

          // WHEN
          $permissionProvider.setDefaultOnAuthorizedMethod(onAuthorizedMethodName);

          //THEN
          expect($permissionProvider.$get().defaultOnAuthorizedMethod).toBe(onAuthorizedMethodName);
        });
      });

      describe('method: setDefaultOnUnauthorizedMethod', function () {
        it('should have default unauthorized method set to hideElement', function () {
          // GIVEN
          // WHEN
          //THEN
          expect($permissionProvider.$get().defaultOnUnauthorizedMethod).toBe('hideElement');
        });

        it('should set custom default unauthorized method when provided', function () {
          // GIVEN
          var onUnauthorizedMethodName = 'customOnUnauthorizedMethod';

          // WHEN
          $permissionProvider.setDefaultOnUnauthorizedMethod(onUnauthorizedMethodName);

          //defaultOnUnauthorizedMethod
          expect($permissionProvider.$get().defaultOnUnauthorizedMethod).toBe(onUnauthorizedMethodName);
        });
      });

      describe('method: suppressUndefinedPermissionWarning', function () {
        it('should not suppress warnings by default', function () {
          // GIVEN
          // WHEN
          //THEN
          expect($permissionProvider.$get().suppressUndefinedPermissionWarning).toBe(false);
        });

        it('should suppress warnings when set to true', function () {
          // GIVEN
          // WHEN
          $permissionProvider.suppressUndefinedPermissionWarning(true);

          //defaultOnUnauthorizedMethod
          expect($permissionProvider.$get().suppressUndefinedPermissionWarning).toBe(true);
        });
      });
    });
  });
});