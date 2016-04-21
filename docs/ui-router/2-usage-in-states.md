After walking through [installation guide](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/1-installation.md) you are ready to start working with controlling access to the states of your application. In order to restrict any states angular-permission rely on ui-router's `data` property, reserving key `permissions` for routes which requires authorization.

Permissions object accepts following properties that accepts:
* `only` - [`String`|`Array<String>`|`Function`|`Promise`]
* `except` - [`String`|`Array<String>`|`Function`|`Promise`]
* `redirectTo` - [`String`|`Function`|`Object`]

Property only and except
----------------------------

Property `only`:
  - when used as `String` or `Arrat`contains single or set of permissions and/or roles that are allowed to access the state
  - returns single or set of permissions and/or roles that are allowed to access the state

Property `except`: 
  - contains single or set of permissions and/or roles that are denied to access the state
  - returns single or set of permissions and/or roles that are denied to access the state

For single permission/role you simply pass it's name as String to only/except property:

```javascript
// We define a route via ui-router's $stateProvider
$stateProvider
  .state('admin', {
    url: '...',
    data: {
      permissions: {
        only: 'isAuthorized'
      }
    }
  });
```
Then when user is trying to access the state validation function provided in PermissionStore/RoleStore is called. 
When returns true or resolved promise, meaning that user is authorized to access the state transition proceeds to `admin` state, otherwise it is stopped.    

For multiple permissions/roles available you can pass an Array:

```javascript
// We define a route via ui-router's $stateProvider
$stateProvider
  .state('admin', {
    url: '...',
    data: {
      permissions: {
        only: ['isAuthorized','ADMIN']
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

Property redirectTo
----------------------------

redirection configuration when user is not authorized to access the state

You can also set `redirectTo` property that will handle unmatched permission redirection:

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
        },
        // or alternatively return customizable redirection object
        redirectTo: function(){
          return {
            state: 'dashboard',
            params: {
              // custom redirection parameters
              paramOne: 'one'
              paramTwo: 'two'
            },
            options: {
             // custom ui-router transition params
             location: false
             reload: true
            }
          }
        }
      }
    }
  })
```

**Important!** Remember to always return _route's state name or object_. Otherwise errors will thrown from either Permission or UI-Router library.

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
          admin: {
            state: 'dashboard',
            params: {
              // custom redirection parameters
              paramOne: 'one'
              paramTwo: 'two'
            },
            options: {
              // custom ui-router transition params
              location: false
              reload: true
            }
          },
          default: 'auth'
        }
      }
    }
  })
```

**Important!** Remember define _default_ property that will handle fallback redirect for not defined permissions. Otherwise errors will thrown from either Permission or UI-Router library. 