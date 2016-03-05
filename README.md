![alt tag](https://travis-ci.org/Narzerus/angular-permission.svg?branch=master)

Permission
============================
*Access Control List based authentication on routes made as simple as it can get.*

Dependencies
----------------------------
- [Angular 1.4+](https://github.com/angular/angular) as MV* framework
- [UI-Router](https://github.com/angular-ui/ui-router) as your router module

Permission is the gatekeeper for your routes
----------------------------
Permission helps you gain control of your routes, by using simple concepts for you to decide who can access them.
I've seen plenty of big fat tutorials on access control implementations, and they can be quite overwhelming. So I bring you a simple, powerful, straightforward solution.

Installation
============================

bower
----------------------------
```
bower install angular-permission --save
```

npm
----------------------------
```
npm install angular-permission --save
```

Include to your dependencies
----------------------------

```javascript
angular.module('yourModule', [..., 'permission', 'ui-router', ...]);
```
**Important!** Angular permission is using ui-router state decoration to be able to inherit permissions/roles from parent states. So make sure that permission dependency is included before ui-router as in example above.

Defining permissions
============================

Setting 
----------------------------
So, how do you tell Permission what does 'anonymous', 'admin' or 'foo' mean and how to know if the current user belongs
to those definitions?

Well, Permission allows you to set different 'permissions' definitions along with the logic that determines if the current
session belongs to them. To do that library exposes special container `PermissionStore` that allows you to manipulate them freely.

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

Removing
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

Defining roles
============================

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


Usage in routes/states
============================
Angular permission rely on ui-router's `data` property, reserving key `permissions` for routes which requires authorization.

Permissions object accepts following parameters:
* only [Array|Function|Promise] - set of allowed permissions/roles
* except [Array|Function|Promise] - set of denied permissions/roles
* redirectTo [String|Function|Object|Promise] - redirection configuration when state permissions/roles are not met


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

Another thing you can do is set `redirectTo` property that will handle unmatched permission redirection:

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

Property `redirectTo` can also accept function:

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

or object with map of permissions/roles:
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


Usage in views
============================
Permission module exposes directive `permission` that can show/hide elements of your application based on set of permissions.

Directives accepts either single permission that has to be met in order to display it's content:
 
```html
<div permission only="'loggedIn'">
  <span>Congrats! You are logged in.</span>  
</div>
```

Or set of permissions separated by 'coma':

```html
<div permission except="['user','admin']">
  <span>You are not 'admin' nor 'user'.</span>  
</div>
```

**Important!** When using async calls to fetch permissions in initial states make sure that modules (or app) are waiting for permissions to be resolved before running them:
   
```html
[index.html]
<div ui-view="root" ng-if="appReady"><div>
```

And in app module: 

```js
 var app = ng.module('app', ['permission']);
 
 app.run(function($rootScope, User){
   User
    .fetchPermission()
    .then(function(){
      $rootScope.appReady = true;
    })
 })
```

Events
============================
- **$stateChangePermissionStart**:
    This event is broadcasted before perform authorize.

    ```javascript
    $rootScope.$on('$stateChangePermissionStart',
    function(event, toState, toParams, options) { ... });
    ```

- **$stateChangePermissionAccepted**:
    This event is broadcasted when one of the permissions has been accepted and the state changes successfully.
    
    ```javascript
    $rootScope.$on('$stateChangePermissionAccepted',
    function(event, toState, toParams, options) { ... });
    ```
    
- **$stateChangePermissionDenied**: 
    This event is broadcasted when the access to the target state is not granted (no permissions found on the `only` array or at least one permission found on the `except` array). This is when the state stays the same or is changed based on the `redirectTo` option.
    
    ```javascript
    $rootScope.$on('$stateChangePermissionDenied',
    function(event, toState, toParams, options) { ... });
    ```

 
Known issues
============================
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
============================
The correct way to contribute is:
  1. Create a branch from the `development` branch
  2. Implement your new feature
  3. Submit a pull request to be merged in the `development` branch
  4. Remember to run `grunt build` before your last commit

Author
============================
- Rafael Vidaurre
- @narzerus
- I'm a full-stack developer currenly working as CTO and Co-Founder at [Finciero](http://www.finciero.com)
