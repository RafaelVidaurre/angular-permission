describe('permission.ui', function () {
  'use strict';
  describe('authorization', function () {

    describe('factory: StatePermissionMap', function () {

      var permStatePermissionMap;
      var permTransitionProperties;

      beforeEach(function () {
        module('permission.ui');

        inject(function ($injector) {
          permStatePermissionMap = $injector.get('permStatePermissionMap');
          permTransitionProperties = $injector.get('permTransitionProperties');
        });
      });

      describe('method: constructor', function () {
        it('should build map including permissions inherited from parent states', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$state']);
          state.$$state.and.callFake(function () {
            return {
              path: [
                {data: {permissions: {only: ['accepted'], except: ['denied']}}},
                {data: {permissions: {only: ['acceptedChild'], except: ['deniedChild']}}}
              ]
            };
          });

          // WHEN
          var map = new permStatePermissionMap(state);

          // THEN
          expect(map.only).toEqual([['accepted'], ['acceptedChild']]);
          expect(map.except).toEqual([['denied'], ['deniedChild']]);
          expect(map.redirectTo).not.toBeDefined();
        });
      });
    });
  });
});