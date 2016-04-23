Manging roles
============================

Overview
----------------------------

1. [Introduction]()
2. [Defining roles]()
  1. [Individual roles]()
  2. [Multiple roles]()
3. [Removing roles]()
4. [Getting all role definitions]()

Before start
----------------------------

Make sure you are familiar with:
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)   

Introduction
----------------------------
Roles are basically named set of abilities that user can have   

Defining roles
----------------------------

Similarly to permissions Permission exposes `RoleStore` that allows to define custom roles used by users in your application. 
They can relate to already existing permissions, so 'Accountant' can be set of 'User' and 'InvoiceEditor' or alternatively custom server/browser validated privilege.    

```javascript
angular
  .module('fooModule', ['permission', 'user'])
  .run(function (RoleStore, User) {
    RoleStore
      // Permission array validated role
      // Library will internally validate if 'user' and 'editor' permissions are valid when checking if role is valid   
      .defineRole('admin', ['user', 'editor']);  
      
    RoleStore    
      // Server side validated role
      .defineRole('accountant', [], function (stateParams) {
        // Let's assume that we are making a request to server here and return response as promise        
        return User.hasRole('accountant');
      });
  });
```

Removing roles
----------------------------
To remove **all** roles use `clearStore` method:  

```javascript
RoleStore.clearStore();
```

Alternatively you can use `removeRoleDefinition` to delete defined role manually:

```javascript
RoleStore.removeRoleDefinition('USER');
```

Retrieving all roles definitions
----------------------------
To get all user roles use method `getStore`:

```javascript
var roles = RoleStore.getStore();
```

----------------------------

| **Next to read**: :point_right: [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/3-controlling-access-in-views.md) |
| --- |