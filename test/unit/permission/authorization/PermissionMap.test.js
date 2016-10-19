describe('permission', function () {
  'use strict';

  describe('authorization', function () {
    describe('factory: PermPermissionMap', function () {

      var PermRoleStore;
      var PermPermissionMap;
      var PermPermissionStore;
      var PermTransitionProperties;

      beforeEach(function () {
        module('permission');

        installPromiseMatchers(); // jshint ignore:line

        inject(function ($injector) {
          PermRoleStore = $injector.get('PermRoleStore');
          PermPermissionMap = $injector.get('PermPermissionMap');
          PermPermissionStore = $injector.get('PermPermissionStore');
          PermTransitionProperties = $injector.get('PermTransitionProperties');
        });
      });

      describe('method: constructor', function () {
        it('should normalize except/only params into array of strings when passed as string', function () {
          // GIVEN
          var mapProperties = {except: 'USER'};

          // WHEN
          var permissionMap = new PermPermissionMap(mapProperties);

          // THEN
          expect(permissionMap.except).toEqual(['USER']);
        });

        it('should normalize except/only params into array of strings when passed as array', function () {
          //GIVEN
          var mapProperties = {except: ['USER']};

          // WHEN
          var permissionMap = new PermPermissionMap(mapProperties);

          // THEN
          expect(permissionMap.except).toEqual(['USER']);
        });

        it('should normalize except/only params into array of strings when passed as function', function () {
          //GIVEN
          var mapProperties = {
            except: function () {
              return ['USER'];
            }
          };

          // WHEN
          var permissionMap = new PermPermissionMap(mapProperties);

          // THEN
          expect(permissionMap.except).toEqual(['USER']);
        });

        it('should normalize except/only params into empty array when passed in any other format', function () {
          //GIVEN
          var mapProperties = {
            except: {
              example: 'object'
            }
          };

          // WHEN
          var permissionMap = new PermPermissionMap(mapProperties);

          // THEN
          expect(permissionMap.except).toEqual([]);
        });
      });

      describe('method: resolveRedirectState', function () {
        it('should return resolved promise of redirectTo value when passed as string', function () {
          // GIVEN
          var redirectToProperty = 'redirectStateName';
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState();

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
        });

        it('should return resolved promise of redirectTo value when passed as object with default property', function () {
          // GIVEN
          var redirectToProperty = {default: 'redirectStateName'};
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState();

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
        });

        it('should throw error when redirectTo value passed as object has not defined default property', function () {
          // GIVEN
          var redirectToProperty = {};
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          // THEN
          expect(function () {
            permissionMap.resolveRedirectState();
          }).toThrow(new ReferenceError('When used "redirectTo" as object, property "default" must be defined'));
        });

        it('should return resolved promise of redirectTo value when passed as object with an injectable function value property', function () {
          // GIVEN
          var adminRedirectTo = jasmine.createSpy('adminRedirectTo').and.returnValue('adminRedirect');
          var redirectToProperty = {
            /**
             * @return {string}
             */
            ADMIN: ['PermRoleStore', 'rejectedPermission', adminRedirectTo],
            default: 'defaultRedirect'
          };
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState('ADMIN');

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'adminRedirect'});
          expect(adminRedirectTo).toHaveBeenCalledWith(PermRoleStore, 'ADMIN');
        });

        it('should return resolved promise of redirectTo value when passed as object with function value property', function () {
          // GIVEN
          var redirectToProperty = {
            /**
             * @return {string}
             */
            ADMIN: function () {
              return 'adminRedirect';
            },
            default: 'defaultRedirect'
          };
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState('ADMIN');

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'adminRedirect'});
        });

        it('should return resolved promise of redirectTo value when passed as object with object value property', function () {
          // GIVEN
          var redirectToProperty = {
            ADMIN: {
              state: 'adminRedirect'
            },
            default: 'defaultRedirect'
          };
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState('ADMIN');

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'adminRedirect'});
        });

        it('should return resolved promise of redirectTo value when passed as object with string value property', function () {
          // GIVEN
          var redirectToProperty = {
            ADMIN: {
              state: 'adminRedirect'
            },
            default: 'defaultRedirect'
          };
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState('ADMIN');

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'adminRedirect'});
        });

        it('should return resolved promise of redirectTo value when passed as an injectable function returning string', function () {
          // GIVEN
          var redirectToFunction = jasmine.createSpy('redirectTo').and.returnValue('redirectStateName');
          var redirectToProperty = ['transitionProperties', 'PermPermissionMap', 'rejectedPermission', redirectToFunction];
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState('unauthorizedPermission');

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
          expect(redirectToFunction).toHaveBeenCalledWith(PermTransitionProperties, PermPermissionMap, 'unauthorizedPermission');
        });

        it('should return resolved promise of redirectTo value when passed as function returning string', function () {
          // GIVEN
          var redirectToProperty = jasmine.createSpy('redirectToProperty').and.returnValue('redirectStateName');
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState('unauthorizedPermission');

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
          expect(redirectToProperty).toHaveBeenCalledWith('unauthorizedPermission', PermTransitionProperties);
        });

        it('should return resolved promise of redirectTo value when passed as function returning object', function () {
          // GIVEN
          var redirectToProperty = function () {
            return {
              state: 'redirectStateName'
            };
          };
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState();

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
        });

        it('should return rejected promise when redirectTo value passed as function returns neither object nor string', function () {
          // GIVEN
          var redirectToProperty = function () {
            return 2;
          };
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState();

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeRejected();
        });

        it('should return rejected promise when redirectTo value is neither String, Function, Object nor Promise', function () {
          // GIVEN
          var redirectToProperty = 2;
          var permissionMap = new PermPermissionMap({redirectTo: redirectToProperty});

          // WHEN
          var redirectStateName = permissionMap.resolveRedirectState();

          // THEN
          expect(redirectStateName).toBePromise();
          expect(redirectStateName).toBeRejected();
        });
      });

      describe('method: resolvePropertyValidity', function () {
        it('should call validation of existing permissions', function () {
          // GIVEN
          var map = new PermPermissionMap();
          var fakePermission = jasmine.createSpyObj('fakePermission', ['validatePermission']);

          spyOn(PermPermissionStore, 'hasPermissionDefinition').and.returnValue(true);
          spyOn(PermPermissionStore, 'getPermissionDefinition').and.returnValue(fakePermission);

          // WHEN
          map.resolvePropertyValidity(['fakePermission']);

          //THEN
          expect(PermPermissionStore.hasPermissionDefinition).toHaveBeenCalled();
          expect(PermPermissionStore.getPermissionDefinition).toHaveBeenCalled();
          expect(fakePermission.validatePermission).toHaveBeenCalled();
        });

        it('should call validation of existing roles', function () {
          // GIVEN
          var map = new PermPermissionMap();
          var fakeRole = jasmine.createSpyObj('fakeRole', ['validateRole']);

          spyOn(PermRoleStore, 'hasRoleDefinition').and.returnValue(true);
          spyOn(PermRoleStore, 'getRoleDefinition').and.returnValue(fakeRole);

          // WHEN
          map.resolvePropertyValidity(['fakeRole']);

          //THEN
          expect(PermRoleStore.hasRoleDefinition).toHaveBeenCalled();
          expect(PermRoleStore.getRoleDefinition).toHaveBeenCalled();
          expect(fakeRole.validateRole).toHaveBeenCalled();
        });

        it('should return rejected promise when neither role nor permission definition found', function () {
          // GIVEN
          var map = new PermPermissionMap();

          // WHEN
          var result = map.resolvePropertyValidity(['fakeRole']);

          //THEN
          expect(result[0]).toBePromise();
          expect(result[0]).toBeRejected();
        });
      });
    });
  });
});