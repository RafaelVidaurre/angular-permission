Manging permissions
============================

Overview
----------------------------

1. [Introduction](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md#introduction)
2. [Defining permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md#defining-permissions)
  1. [Individual permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md#individual-permissions)
  2. [Multiple permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md#multiple-permissions)
3. [Removing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md#removing-permissions)
4. [Getting all permission definitions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md#getting-all-permission-definitions)

Introduction
----------------------------

Let's start with little explanation **what** permission is. Permission is the most atomic **ability** that user can have 
in you application. So you can think about permission as a smallest action that user can do inside your site. 

But do `user` or `anonymous` can be a permission? Technically yes, but from business point of view you should treat them 
as Roles that are more complex objects that can store more complex logic. 

> :bulb: **Note**   
> It's a good convention to start permission with a verb and combine them with resource or object, so permissions like `readDocuments` or `listSongs` 
are meaningful and easy to understand for other programmes. Notice that they are named lowerCamelCase for easy differentiation form roles.
 
Defining permissions
----------------------------
So, how do you tell Permission what does 'readDocuments' or 'listSongs' or mean and how to know if the current user belongs
to those definitions?

Well, Permission allows you to set different 'permissions' definitions along with the logic that determines if the current 
session belongs to them. To do that library exposes special container `PermissionStore` that allows you to manipulate them freely.

### Individual permissions

To define permissions individually `PermissionStore` exposes method `definePermission` that generic usage is shown below: 

```javascript
  [...]
  .definePermission('permissionName', function (permissionName, transitionProperties) {
        [...]
      });
  });
```

Validation function accepts two parameters that can be used to implement more complex validation logic.

| Parameter              | Description                                                               | 
| :--------------------- | :------------------------------------------------------------------------ |
| `permissionName`       | String representing name of checked permission                            |
| `transitionProperties` | TransitionProperties object storing properties of transited states/routes |


It also have to return one of values to properly represent results:
 
| Validation result      | Returned value             | 
| :--------------------- | :------------------------- |
| Valid                  | [`true`|`$q.resolve()`]    |
| Invalid                | [``false`|`$q.reject()`]   |

> :bulb: **Note**   
> You can not define permissions on `config` stage of modules.

Knowing that let's consider deadly simple example for defining permission. We want user to create `seeDashboard` permission that 
not corresponds to any server-related permissions. We can do that inside our top level `app` module in `run` section. 
  
```javascript
angular
  .module('app', ['permission'])
  .run(function (PermissionStore) {
    PermissionStore
      .definePermission('seeDashboard', function () {
        return true;
      });
  });
```

In the example above permission `seeDashboard` is always valid as it always returns true. So as long it's not removed from 
the `PermissionStore` will always allow user to pass authorization.   

Sometimes you will need to call some a back-end api or do some other asynchronous task to check if permission is still 
valid. For that you can use promises and simply return them from validation function:

```javascript
PermissionStore
  // Define user permission calling back-end
  .definePermission('hasValidSession', function () {
    // Let's assume that User service calls backend API via $http and return promise:
    // -- $q.resolve() means that session is active 
    // -- $q.reject() means that session expired
    return User.checkSession();
  });
```

### Multiple permissions

To define multiple permissions that share same validation method method `definePermission` can be used. The only 
difference form `definePermission` is that it accepts `Array` of permission names instead of single one. 

```javascript
  [...]
  .definePermission('permissionNamesArray', function (permissionName, transitionProperties) {
        [...]
      });
  });
```

Often meet example of usage is set of permissions (e.g. received from server after user login) that you will iterate over to 
check if permission is valid. An example implementation of that showing with little lodash magic is shown below:

```javascript
var permissions = ['listMeeting', 'seeMeeting', 'editMeeting', 'deleteMeeting']

PermissionStore.defineManyPermissions(permissions, function (permissionName) {
  return _.contains(permissions, permissionName);
});
```

Removing permissions
----------------------------

You can easily **all** permissions form the `PermissionStore` (e.g. after user logged out or switched profile) by calling:  

```javascript
PermissionStore.clearStore();
```

Alternatively you can use `removePermissionDefinition` to delete defined permissions manually:

```javascript
PermissionStore.removePermissionDefinition('user');
```

Getting all permission definitions
----------------------------

To get all user permissions use method `getStore`:

```javascript
var permissions = PermissionStore.getStore();
```

----------------------------

| **Next to read**: :point_right: [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md) |
| --- |