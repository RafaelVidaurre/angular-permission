describe('service: RoleStore', function () {
  'use strict';

  var $q, $rootScope, RoleStore, PermissionStore, Role;

  beforeEach(function () {
    module('permission');
  });

  beforeEach(function () {
    inject(function ($injector) {
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
      Role = $injector.get('Role');
      RoleStore = $injector.get('RoleStore');
      PermissionStore = $injector.get('PermissionStore');
    });
  });

  beforeEach(function () {
    PermissionStore.definePermission('USER', function () {
      return true;
    });

    RoleStore.defineRole('ACCOUNTANT', ['USER']);

    RoleStore.defineRole('MANGER', [], function(){
      return true;
    });
  });

  describe('method: defineRole', function () {
    it('should add role definition to store when passed array of permissions', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(RoleStore.hasRoleDefinition('ACCOUNTANT')).toBe(true);
    });

    it('should add role definition to store when passed validation function', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(RoleStore.hasRoleDefinition('MANGER')).toBe(true);
    });
  });

  describe('method: getRoleDefinition', function () {
    it('should return role definition object', function () {
      // GIVEN
      // WHEN
      var permission = RoleStore.getRoleDefinition('ACCOUNTANT');

      // THEN
      expect(permission instanceof Role).toBeTruthy();
    });
  });

  describe('method: hasRoleDefinition', function () {
    it('should check if role is defined when passed array of permissions', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(RoleStore.hasRoleDefinition('ACCOUNTANT')).toBeTruthy();
    });

    it('should check if role is defined when passed validation function', function () {
      // GIVEN
      // WHEN
      // THEN
      expect(RoleStore.hasRoleDefinition('MANGER')).toBeTruthy();
    });
  });

  describe('method: getStore', function () {
    it('should return all defined roles', function () {
      // GIVEN
      // WHEN
      var store = RoleStore.getStore();
      // THEN
      expect(Object.keys(store).length).toEqual(2);
    });
  });

  describe('method: clearStore', function () {
    it('should remove all role definitions', function () {
      // GIVEN
      // WHEN
      RoleStore.clearStore();

      // THEN
      expect(Object.keys(RoleStore.getStore()).length).toBe(0);
    });
  });

  describe('method: removeRoleDefinition', function () {
    it('should remove role definition from store', function () {
      // GIVEN
      // WHEN
      RoleStore.removeRoleDefinition('ACCOUNTANT');

      // THEN
      expect(RoleStore.hasRoleDefinition('ACCOUNTANT')).toBeFalsy();
    });
  });
});