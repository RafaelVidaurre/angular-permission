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
        it('should build map including permissions and redirection rules inherited from parent states', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$permissionState']);
          state.$$permissionState.and.callFake(function () {
            var parent = {
              permissions: {
                only: ['accepted'],
                except: ['denied'],
                redirectTo: {
                  accepted: 'deniedState',
                  default: 'defaultState'
                }
              }
            };
            var child = Object.create(parent);

            child.permissions = {
              only: ['acceptedChild'],
              except: ['deniedChild'],
              redirectTo: {
                acceptedChild: 'deniedChildState',
                default: 'defaultState'
              }
            };

            return {
              path: [
                {data: child},
                {data: parent}
              ]
            };
          });

          // WHEN
          var map = new PermStatePermissionMap(state);

          // THEN
          expect(map.only).toEqual([['acceptedChild'], ['accepted']]);
          expect(map.except).toEqual([['deniedChild'], ['denied']]);
          expect(map.redirectTo).toEqual({
            'accepted': jasmine.any(Function),
            'acceptedChild': jasmine.any(Function),
            'default': jasmine.any(Function)
          });
        });

        it('should not duplicate parent state inheritance if child does not have permissions', function () {
          // GIVEN
          var state = jasmine.createSpyObj('state', ['$$permissionState']);
          state.$$permissionState.and.callFake(function () {
            var grandparent = {permissions: {only: ['accepted'], except: ['denied']}};
            var parent = Object.create(grandparent);
            parent.permissions = {
              only: ['acceptedChild'],
              except: ['deniedChild']
            };
            var child = Object.create(parent);

            return {
              path: [
                {data: child},
                {data: parent},
                {data: grandparent}
              ]
            };
          });

          // WHEN
          var map = new PermStatePermissionMap(state);

          // THEN
          expect(map.only).toEqual([['acceptedChild'], ['accepted']]);
          expect(map.except).toEqual([['deniedChild'], ['denied']]);
          expect(map.redirectTo).not.toBeDefined();
        });
      });
    });
  });
})
;