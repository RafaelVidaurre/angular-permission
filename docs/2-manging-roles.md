Manging roles
============================

Before start
----------------------------

Make sure you are familiar with:
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)   

Overview
----------------------------

1. [Introduction](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md#before-start)
2. [Defining roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md#defining-roles)
  1. [Individual roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md#individual-roles)
  2. [Multiple roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md#multiple-roles)
3. [Removing roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md#removing-roles)
4. [Getting all role definitions](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md#getting-all-roles-definitions)

Introduction
----------------------------
By definition role is named set of abilities (permissions) by which specific group of users is identified. 
So `USER` and `ANONYMOUS` are roles not permissions. We can represent our `USER` as group of permissions that identifies his like: `listArticles`, `editArticles` and other custom server/browser validated privileges.    

> :bulb: **Note**   
> It's a good convention to name roles with UPPER_CASE, so roles like `ACCOUNTANT` or `ADMIN` are easier to distinguish from permissions.

Defining roles
----------------------------

### Individual roles

Similarly to permissions we are gonna use here `RoleStore` that exposes `defineRole` allowing to define custom roles used by users in your application. 

```javascript
[...]

RoleStore
  .defineRole('ROLE_NAME', ['permissionNameA', 'permissionNameB', 'permissionNameC', ...])
  
RoleStore
  .defineRole('ROLE_NAME', function (roleName, transitionProperties) {
        [...]
      });
  });
```

The main deference is that Role definition accepts either array of permissions names that identify role or validation function used similarly like in permissions.

> :bulb: **Note**   
> When defining role with array of permission names, make sure that your permissions will be defined via `PermissionStore` method `definePermission`. If not on first state or route check `Authorisation` service will call for their validity, and if they won't be present it might reject authorization, as an effect of not having role.

Validation function accepts two parameters that can be used to implement more complex validation logic.

| Parameter              | Description                                                               | 
| :--------------------- | :------------------------------------------------------------------------ |
| `roleName`             | String representing name of checked role                                  |
| `transitionProperties` | TransitionProperties object storing properties of transited states/routes |


It also have to return one of values to properly represent results:
 
| Validation result      | Returned value             | 
| :--------------------- | :------------------------- |
| Valid                  | [`true` | `$q.resolve()`]  |
| Invalid                | [`false` | `$q.reject()`]  |

> :bulb: **Note**   
> You can not define roles on `config` stage of modules.

Usage of `defineRole` is very similar to `definePermission`:

```javascript
RoleStore
  // Permission array validated role
  // Library will internally validate if 'listEvents' and 'editEvents' permissions are valid when checking if role is valid   
  .defineRole('ADMIN', ['listEvents', 'editEvents']);  
  
RoleStore    
  // Or use your own function/service to validate role
  .defineRole('USER', function () {        
    return Session.checkSession();
  });
```

### Multiple roles

Service `RoleStore` allows you define multiple roles with `defineManyRoles` method. This method accepts `Object` containing keys as a role names and corresponding validators as values. 

```
RoleStore    
  // Or use your own function/service to validate role
  .defineManyRoles({
    'AUTHORIZED': function () {        
      return Session.checkSession();
    }),
    `USER`: ['canReadInvoices']
    'ADMIN': ['canReadInvoices','canEditInvoices','canUploadImages']
  });
```

> :bulb: **Note**   
> This method is highly effective when you fetch role definitions form server together with permissions.   

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

Getting all roles definitions
----------------------------

To get all roles form `RoleStore` use method `getStore`:

```javascript
var roles = RoleStore.getStore();
```

----------------------------

| **Next to read**: :point_right: [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/3-controlling-access-in-views.md) |
| --- |