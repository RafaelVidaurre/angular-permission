describe('permission.ui', function () {
  'use strict';
  describe('authorization', function () {

    describe('factory: StatePermissionMap', function () {

      var PermStatePermissionMap;
      var PermTransitionProperties;

      beforeEach(function () {
        module('permission.ui');

        inject(function ($injector) {
          PermStatePermissionMap = $injector.get('PermStatePermissionMap');
          PermTransitionProperties = $injector.get('PermTransitionProperties');
        });
      });

      describe('method: constructor', function () {
        it('should build map including permissions inherited from parent states', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$permissionState']);
          state.$$permissionState.and.callFake(function () {
            return {
              path: [
                {data: {permissions: {only: ['accepted'], except: ['denied']}}},
                {data: {permissions: {only: ['acceptedChild'], except: ['deniedChild']}}}
              ]
            };
          });

          // WHEN
          var map = new PermStatePermissionMap(state);

          // THEN
          expect(map.only).toEqual([['accepted'], ['acceptedChild']]);
          expect(map.except).toEqual([['denied'], ['deniedChild']]);
          expect(map.redirectTo).not.toBeDefined();
        });
      });
    });
  });
});