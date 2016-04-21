Setting 
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

Removing
----------------------------
To remove _all_ roles after user logged out or switched profile use:  

```javascript
RoleStore.clearStore();
```

Alternatively you can use `removeRoleDefinition` to delete defined role manually:

```javascript
RoleStore.removeRoleDefinition('user');
```

Retrieving all roles definitions
----------------------------
To get all user roles use method `getStore`:

```javascript
var roles = RoleStore.getStore();
```
