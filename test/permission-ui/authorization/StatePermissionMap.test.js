describe('permission.ui', function () {
  'use strict';
  describe('authorization', function () {

    describe('factory: StatePermissionMap', function () {

      var StatePermissionMap;
      var TransitionProperties;

      beforeEach(function () {
        module('permission.ui');

        inject(function ($injector) {
          StatePermissionMap = $injector.get('StatePermissionMap');
          TransitionProperties = $injector.get('TransitionProperties');
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
          var map = new StatePermissionMap(state);

          // THEN
          expect(map.only).toEqual([['acceptedChild'], ['accepted']]);
          expect(map.except).toEqual([['deniedChild'], ['denied']]);
          expect(map.redirectTo).not.toBeDefined();
        });
      });
    });
  });
});