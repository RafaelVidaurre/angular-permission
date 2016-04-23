Manging permissions
============================

Overview
----------------------------

1. Introduction
2. Defining permissions
3. Removing permissions
4. Retrieving all permission definitions

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

### Permissions defined in a browser

Let's consider the most simple example for defining permission locally. We want user to have `seeDashboard` permission that 
not corresponds to any server-related permissions. We can simply define it inside our `app` module in run section. 

> :bulb: **Note**   
> You can not define permissions on `config` stage of modules.
  
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

Validation function have to return either `true` - Boolean - or `$q.resolve()` - resolved Promise - object in order to treat
 permission as valid, whereas `false` - Boolean - or `$q.reject()` - rejected Promise - is treated as non-valid permission. 
 In the example above permission `seeDashboard` is always valid as it always returns true. So as long it's not removed 
 from the `PermissionStore` will always allow user to pass authorization.   

Validation function accepts two parameters that can be used to implement more complex validation logic.

```javascript
  [...]
  .definePermission('permissionName', function (permissionName, transitionProperties) {
        [...]
      });
  });

```

| Parameter              | Description                                                               | 
| :--------------------- | :------------------------------------------------------------------------ |
| `permissionName`       | String representing name of checked permission                            |
| `transitionProperties` | TransitionProperties object storing properties of transited states/routes |

```javascript
// Let's imagine we have a User service which has information about the current user in the session
// and is undefined if no session is active
//
// We will define the following permissions:
// anonymous: When there is not user currently logged in
// normal: A user with isAdmin = false
// admin: A user with isAdmin = true

angular
  .module('fooModule', ['permission', 'user'])
  .run(function (PermissionStore, User) {
    // Define anonymous permission
    PermissionStore
      .definePermission('anonymous', function (stateParams) {
        // If the returned value is *truthy* then the user has the permission, otherwise they don't
        if (!User) {
          return true; // Is anonymous
        }
        return false;
      });
  });
```

Sometimes you will need to call some a back-end api or some other asynchronous task to define the permission.
For that you can use promises:

```javascript
angular.module('barModule', ['permission', 'user'])
  .run(function (PermissionStore, User, $q) {
    PermissionStore
      // Define user permission calling back-end
      .definePermission('user', function (stateParams) {
        // This time we will return a promise
        // If the promise *resolves* then the user has the permission, if it *rejects* (you guessed it)

        // Let's assume this returns a promise that resolves or rejects if session is active
        return User.checkSession();
      })
      
    PermissionStore
      // A different example for admin
      .definePermission('admin', function (stateParams) {
        var deferred = $q.defer();

        User.getAccessLevel()
          .then(function (data) {
            if (data.accessLevel === 'admin') {
              deferred.resolve();
            } else {
              deferred.reject();
            }
          }
          .catch(function () {
            // Error with request
            deferred.reject();
          });

        return deferred.promise;
      });
  });
```

You can also set many permissions which share the same validator. This is useful when you have some central service which handles the validation.

To define many permissions which share one validator callback, use `defineManyPermissions(<array>, <validator function>)`

```javascript
PermissionStore.defineManyPermissions(arrayOfPermissionNames, function (stateParams, permissionName) {
  return User.hasPermissionDefinition(permissionName);
});
```

or use internal `Permission` service to check if user has one of permissions:

```javascript
PermissionStore.defineManyPermissions(arrayOfPermissionNames, function (stateParams, permissionName) {
  return Permission.hasPermissionDefinition(permissionName);
});
```

Removing permissions
----------------------------
You can easily remove _all_ permissions after user logged out or switched profile:  

```javascript
PermissionStore.clearStore();
```

Alternatively you can use `removePermissionDefinition` to delete defined permissions manually:

```javascript
PermissionStore.removePermissionDefinition('user');
```

Retrieving all permission definitions
----------------------------
To get all user permissions use method `getStore`:

```javascript
var permissions = PermissionStore.getStore();
```