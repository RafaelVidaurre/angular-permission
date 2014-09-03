Permission
==========
*Role and permission based authentication on routes as simple as it can get.*

- Requires you to use [ui-router](https://github.com/angular-ui/ui-router) as your router module.

Permission is the gatekeeper for your routes
--------------------------------------------
Permission helps you gain control of your routes, by using simple concepts for you to decide who can access them.
I've seen a lot of giant tutorials on access control implementation, and they can be quite overwhelming.


Setting route permissions/roles
-------------------------------
This is how simple Permission makes it for you to define a route which requires authorization.

```javascript

  // We define a route via ui-router's $routeProvider
  $routeProvider
    .state('staffpanel', {
      url: '...',
      permissions: {
        only: ['admin', 'moderator']
      }
    });
```

You can either set an `only` or an `except` array.

```javascript
  // Let's prevent anonymous users from looking at a dashboard
  $routeProvider
    .state('dashboard', {
      url: '...',
      permissions: {
        except: ['anonymous']
      }
    });
```

Another thing you can do is setting a redirect url to which unauthorized sessions will go to.

```javascript
  $routeProvider
    .state('dashboard', {
      url: '...',
      permissions: {
        except: ['anonymous'],
        redirectTo: 'login'
      }
    });
```


Defining roles
--------------------------
So, how do yo tell Permission what does 'anonymous', 'admin' or 'foo' mean and how to know if the current user belongs
to those definitions?

Well, Permission allows you to define different 'roles' along which the logic that determines if the current 
session belongs to them.

```javascript
  // Let's imagine we have a User service which has information about the current user in the session
  // and is undefined if no session is active
  //
  // We will define the following roles:
  // anonymous: When there is not user currenly logged in
  // normal: A user with isAdmin = false
  // admin: A user with isAdmin = true
  
  angular.module('fooModule', ['permission', 'user'])
    .run(function (Permission, User), {
      // Define anonymous role
      Permission.defineRole('anonymous', function () {
        // If the returned value is *truthy* then the user has the role, otherwise they don't
        if (!User) {
          return true; // Is anonymous
        }
        return false;
      });
    });
```

Sometimes you will need to call some a back-end api or some other asyncronous task to define the role
For that you can use promises

angular.module('barModule', ['permission', 'user'])
  .run(function (Permission, User, $q) {
    Permission
      // Define user role calling back-end
      .defineRole('user', function () {
        // This time we will return a promise
        // If the promise *resolves* then the user has the role, if it *rejects* (you guessed it)
        
        // Let's assume this returns a promise that resolves or rejects if session is active
        return User.checkSession();
      })
      // A different example for admin
      .defineRole('admin', function () {
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
  
As you can see, Permission is useful wether you want a role-based access control or a permission-based one, as
it allows you to define this behaviour however you wish.

TODOS:
-----
- Passing state parameters on redirect and/or broadcasting events to allow better control and customization


Contribute
==========
This project is still in diapers and I would love your feedback / help in making this a great module 
for angular developers to use


Author
======
Rafael Vidaurre
@narzerus
I'm a full-stack developer currenly working as CTO and Co-Founder at [Finciero](http://www.finciero.com)


