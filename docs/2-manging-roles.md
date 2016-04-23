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
By definition role is named set of abilities (permissions) by which specific group of users is identified. 
So `USER` and `ANONYMOUS` are roles not permissions. We can represent our `USER` as group of permissions that identifies his like: `listArticles`, `editArticles` and other custom server/browser validated privileges.    

> :bulb: **Note**   
> It's a good convention to name roles with UPPER_CASE, so roles like `ACCOUNTANT` or `ADMIN` are easier to distinguish from permissions.

Defining roles
----------------------------

Similarly to permissions we are gonna use here `RoleStore` that exposes `defineRole` allowing to define custom roles used by users in your application. 

```javascript
[...]

RoleStore
  .defineRole('roleName', ['permissionNameA', 'permissionNameB', 'permissionNameC', ...])
  .defineRole('roleName', function (roleName, transitionProperties) {
        [...]
      });
  });
```

The main deference is that Role definition accepts either array of permissions names that identify role or validation function used similarly like in permissions.

> :bulb: **Note**   
> When defining role with permissions array make sure that your permissions will be defined, because on first 
state or route authentication `Authorisation` service will check for their validity and if they won't be present it 
might reject authorization as an effect of not having role.

Validation function accepts two parameters that can be used to implement more complex validation logic.

| Parameter              | Description                                                               | 
| :--------------------- | :------------------------------------------------------------------------ |
| `permissionName`       | String representing name of checked permission                            |
| `transitionProperties` | TransitionProperties object storing properties of transited states/routes |


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