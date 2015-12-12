![alt tag](https://travis-ci.org/Narzerus/angular-permission.svg?branch=master)

Permission
==========
*Access Control List based authentication on routes made as simple as it can get.*

Dependencies
------------
- [Angular](https://github.com/angular/angular) as MV* framework
- [UI-Router](https://github.com/angular-ui/ui-router) as your router module

Permission is the gatekeeper for your routes
--------------------------------------------
Permission helps you gain control of your routes, by using simple concepts for you to decide who can access them.
I've seen plenty of big fat tutorials on access control implementations, and they can be quite overwhelming. So I bring you a simple, powerful, straightforward solution.

Installation
================

bower
-----------------
```
bower install angular-permission --save
```

npm
-----------------
```
npm install angular-permission --save
```

Usage
================

Include to your dependencies
----------------------------
```javascript
angular.module('yourModule', [..., 'permission']);
```

Setting route permissions/permissions
-------------------------------
This is how simple Permission makes it for you to define a route which requires authorization.

```javascript
// We define a route via ui-router's $stateProvider
$stateProvider
  .state('staffpanel', {
    url: '...',
    data: {
      permissions: {
        only: ['admin', 'moderator']
      }
    }
  });
```

You can either set an `only` or an `except` array.

```javascript
// Let's prevent anonymous users from looking at a dashboard
$stateProvider
  .state('dashboard', {
    url: '...',
    data: {
      permissions: {
        except: ['anonymous']
      }
    }
  });
```

Another thing you can do is set a redirect url to which unauthorized sessions will go to.

```javascript
$stateProvider
  .state('dashboard', {
    url: '...',
    data: {
      permissions: {
        except: ['anonymous'],
        redirectTo: 'login'
      }
    }
  });
```

Property `redirectTo` can accept function:

```javascript
$stateProvider
  .state('agenda', {
    data: {
      permissions: {
        only: ['manager'],
        redirectTo: function(){
          return 'auth';
        }
      }
    }
  })
```

**Important!** Remember to always return _route's state_. Otherwise errors will thrown from either Permission or UI-Router library.

or object with map of permissions:
```javascript
$stateProvider
  .state('agenda', {
    data: {
      permissions: {
        only: ['manager'],
        redirectTo: {
          account: 'profile',
          user: function(){
            return 'dashboard';
          },
          default: 'auth'
        }
      }
    }
  })
```

**Important!** Remember define _default_ property that will handle fallback redirect for not defined permissions. Otherwise errors will thrown from either Permission or UI-Router library. 

Setting permissions
--------------------------
So, how do yo tell Permission what does 'anonymous', 'admin' or 'foo' mean and how to know if the current user belongs
to those definitions?

Well, Permission allows you to set different 'permissions' along with the logic that determines if the current
session belongs to them.

```javascript
// Let's imagine we have a User service which has information about the current user in the session
// and is undefined if no session is active
//
// We will define the following permissions:
// anonymous: When there is not user currently logged in
// normal: A user with isAdmin = false
// admin: A user with isAdmin = true

angular.module('fooModule', ['permission', 'user'])
  .run(function (Permission, User) {
    // Define anonymous permission
    Permission.setPermission('anonymous', function (stateParams) {
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
  .run(function (Permission, User, $q) {
    Permission
      // Define user permission calling back-end
      .setPermission('user', function (stateParams) {
        // This time we will return a promise
        // If the promise *resolves* then the user has the permission, if it *rejects* (you guessed it)

        // Let's assume this returns a promise that resolves or rejects if session is active
        return User.checkSession();
      })
      // A different example for admin
      .setPermission('admin', function (stateParams) {
        var deferred = $q.defer();

        User.getAccessLevel().then(function (data) {
          if (data.accessLevel === 'admin') {
            deferred.resolve();
          } else {
            deferred.reject();
          }
        }, function () {
          // Error with request
          deferred.reject();
        });

        return deferred.promise;
      });
  });
```

You can also set many permissions which share the same validator. This is useful when you have some central service which handles the validation.

To define many permissions which share one validator callback, use `setManyPermissions(<array>, <validator function>)`

```javascript
Permission.setManyPermissions(arrayOfPermissionNames, function (stateParams, permissionName) {
  return User.hasPermission(permissionName);
});
```

or use internal `Permission` service to check if user has one of permissions:

```javascript
Permission.setManyPermissions(arrayOfPermissionNames, function (stateParams, permissionName) {
  return Permission.hasPermission(permissionName);
});
```

Removing Permissions
-----
You can easily remove _all_ permissions after user logged out or switched profile:  

```javascript
Permission.clearPermissions();
```

Alternatively you can use `removePermission` and `removeManyPermissions` to delete defined permissions manually:

```javascript
Permission.removePermission('user');
Permission.removeManyPermissions(['admin', 'superAdmin']);
```

Helper Method
-----
To get all user permissions use method `getPermissions`:

```javascript
var permissions = Permission.getPermissions();
```

Views
-----
Permission module exposes two directives `permission-only` and `permission-except` that can show/hide elements of your application based on set of permissions.

Directives accepts either single permission that has to be met in order to display it's content:
 
```html
<div permission-only="loggedIn">
  <span>Congrats! You are logged in.</span>  
</div>
```

Or set of permissions separated by 'coma':

```html
<div permission-except="user,admin">
  <span>You are not 'admin' nor 'user'.</span>  
</div>
```

When using async calls to fetch permissions make sure that modules (or app) are waiting for permissions to be resolved before running them:
   
```html
[index.html]
<div ui-view="root" ng-if="appReady"><div>
```

And in app module: 

```js
 var app = ng.module('app', ['permission']);
 
 app.run(function($rootScope, Permission, User){
   User
    .fetchPermission()
    .then(function(){
      $rootScope.appReady = true;
    })
 })
```

Events
------
- **$stateChangePermissionStart**: This event is broadcasted before perform authorize.

- **$stateChangePermissionAccepted**: This event is broadcasted when one of the permissions has been accepted and the state changes successfully.

- **$stateChangePermissionDenied**: This event is broadcasted when the access to the target state is not granted (no permissions found on the `only` array or at least one permission found on the `except` array). This is when the state stays the same or is changed based on the `redirectTo` option.


Caveats
=======
Because of a bug in ui-router, when using `$urlStateProvider.otherwise` we get an **infinite digest** loop error.
A workaround was found by [@shoaibmerchant](https://github.com/shoaibmerchant) and it goes like this:

```javascript
// Normal usage (creates INFDG error)
$urlRouterProvider.otherwise('/somestate');

// Instead
$urlRouterProvider.otherwise( function($injector) {
  var $state = $injector.get("$state");
  $state.go('/somestate');
});
```

Contributing
============
This project is still in diapers and I would love your feedback / help in making this a great module
for angular developers to use.

The correct way to contribute is:
  1. Create a branch from the `development` branch
  2. Implement your new feature
  3. Submit a pull request to be merged in the `development` branch
  4. Remember to run `grunt build` before your last commit

Author
======
- Rafael Vidaurre
- @narzerus
- I'm a full-stack developer currenly working as CTO and Co-Founder at [Finciero](http://www.finciero.com)
