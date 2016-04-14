describe('authorization: PermissionMap', function () {
  'use strict';

  var RoleStore;
  var PermissionMap;
  var PermissionStore;

  beforeEach(function () {
    module('permission');

    installPromiseMatchers(); // jshint ignore:line

    inject(function ($injector) {
      RoleStore = $injector.get('RoleStore');
      PermissionMap = $injector.get('PermissionMap');
      PermissionStore = $injector.get('PermissionStore');
    });
  });

  describe('method: constructor', function () {
    it('should normalize except/only params into array of strings when passed as string', function () {
      // GIVEN
      var mapProperties = {except: 'USER'};

      // WHEN
      var permissionMap = new PermissionMap(mapProperties);

      // THEN
      expect(permissionMap.except).toEqual(['USER']);
    });

    it('should normalize except/only params into array of strings when passed as array', function () {
      //GIVEN
      var mapProperties = {except: ['USER']};

      // WHEN
      var permissionMap = new PermissionMap(mapProperties);

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
      var permissionMap = new PermissionMap(mapProperties);

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
      var permissionMap = new PermissionMap(mapProperties);

      // THEN
      expect(permissionMap.except).toEqual([]);
    });
  });

  describe('method: resolveRedirectState', function () {
    it('should return resolved promise of redirectTo value when passed as string', function () {
      // GIVEN
      var redirectToProperty = 'redirectStateName';
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

      // WHEN
      var redirectStateName = permissionMap.resolveRedirectState();

      // THEN
      expect(redirectStateName).toBePromise();
      expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
    });

    it('should return resolved promise of redirectTo value when passed as object with default property', function () {
      // GIVEN
      var redirectToProperty = {default: 'redirectStateName'};
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

      // WHEN
      var redirectStateName = permissionMap.resolveRedirectState();

      // THEN
      expect(redirectStateName).toBePromise();
      expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
    });

    it('should throw error when redirectTo value passed as object has not defined default property', function () {
      // GIVEN
      var redirectToProperty = {};
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

      // WHEN
      // THEN
      expect(function () {
        permissionMap.resolveRedirectState();
      }).toThrow(new ReferenceError('When used "redirectTo" as object, property "default" must be defined'));
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
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

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
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

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
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

      // WHEN
      var redirectStateName = permissionMap.resolveRedirectState('ADMIN');

      // THEN
      expect(redirectStateName).toBePromise();
      expect(redirectStateName).toBeResolvedWith({state: 'adminRedirect'});
    });

    it('should return resolved promise of redirectTo value when passed as function returning string', function () {
      // GIVEN
      var redirectToProperty = function () {
        return 'redirectStateName';
      };
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

      // WHEN
      var redirectStateName = permissionMap.resolveRedirectState();

      // THEN
      expect(redirectStateName).toBePromise();
      expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
    });

    it('should return resolved promise of redirectTo value when passed as function returning string', function () {
      // GIVEN
      var redirectToProperty = function () {
        return 'redirectStateName';
      };
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

      // WHEN
      var redirectStateName = permissionMap.resolveRedirectState();

      // THEN
      expect(redirectStateName).toBePromise();
      expect(redirectStateName).toBeResolvedWith({state: 'redirectStateName'});
    });

    it('should return resolved promise of redirectTo value when passed as function returning object', function () {
      // GIVEN
      var redirectToProperty = function () {
        return {
          state: 'redirectStateName'
        };
      };
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

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
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

      // WHEN
      var redirectStateName = permissionMap.resolveRedirectState();

      // THEN
      expect(redirectStateName).toBePromise();
      expect(redirectStateName).toBeRejected();
    });

    it('should return rejected promise when redirectTo value is neither String, Function, Object nor Promise', function () {
      // GIVEN
      var redirectToProperty = 2;
      var permissionMap = new PermissionMap({redirectTo: redirectToProperty});

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
      var map = new PermissionMap();
      var fakePermission = jasmine.createSpyObj('fakePermission', ['validatePermission']);

      spyOn(PermissionStore,'hasPermissionDefinition').and.returnValue(true);
      spyOn(PermissionStore,'getPermissionDefinition').and.returnValue(fakePermission);

      // WHEN
      map.resolvePropertyValidity(['fakePermission']);

      //THEN
      expect(PermissionStore.hasPermissionDefinition).toHaveBeenCalled();
      expect(PermissionStore.getPermissionDefinition).toHaveBeenCalled();
      expect(fakePermission.validatePermission).toHaveBeenCalled();
    });

    it('should call validation of existing roles', function () {
      // GIVEN
      var map = new PermissionMap();
      var fakeRole = jasmine.createSpyObj('fakeRole', ['validateRole']);

      spyOn(RoleStore,'hasRoleDefinition').and.returnValue(true);
      spyOn(RoleStore,'getRoleDefinition').and.returnValue(fakeRole);

      // WHEN
      map.resolvePropertyValidity(['fakeRole']);

      //THEN
      expect(RoleStore.hasRoleDefinition).toHaveBeenCalled();
      expect(RoleStore.getRoleDefinition).toHaveBeenCalled();
      expect(fakeRole.validateRole).toHaveBeenCalled();
    });

    it('should return rejected promise when neither role nor permission definition found', function () {
      // GIVEN
      var map = new PermissionMap();

      // WHEN
      var result = map.resolvePropertyValidity(['fakeRole']);

      //THEN
      expect(result[0]).toBePromise();
      expect(result[0]).toBeRejected();
    });
  });
});