Usage in ui-router states
============================

Before start
----------------------------

Make sure you are familiar with:
- [Installation guide for ui-router](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/1-installation.md)   
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)   
- [Manging routes](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)   

Overview
----------------------------

1. [Introduction](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#introduction)
2. [Property only and except](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#property-only-and-except)
  1. [Single permission/role](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#single-permissionrole)
  2. [Multiple permissions/roles](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#multiple-permissionsroles) 
  3. [Dynamic access](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#dynamic-access)
3. [Property redirectTo](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#property-redirectto)
  1. [Single rule redirection](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#single-redirection-rule)
  2. [Multiple rule redirection](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#multiple-redirection-rules)  
  3. [Dynamic redirection rules](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#dynamic-redirection-rules)  
4. [State access inheritance](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md#state-access-inheritance)


Introduction
----------------------------

Now you are ready to start working with controlling access to the states of your application. In order to restrict any state angular-permission rely on ui-router's `data` property, reserving key `permissions` allowing to define authorization configuration.

Permissions object accepts following properties:

| Property        | Accepted value             |
| :-------------- | :------------------------- |
| `only`          | `[String|Array|Function]`  |
| `except`        | `[String|Array|Function]`  |
| `redirectTo`    | `[String|Function|Object]` |

Property only and except
----------------------------

Property `only`:
  - is used to explicitly define permission or role that are allowed to access the state   
  - when used as `String` contains single permission or role
  - when used as `Array` contains set of permissions and/or roles
  - when used as `Function` or `Promise` returns single/set of permissions and/or roles

Property `except`: 
  - is used to explicitly define permission or role that are denied to access the state
  - when used as `String` contains single permission or role
  - when used as `Array` contains set of permissions and/or roles
  - when used as `Function` or `Promise` returns single or set of permissions and/or roles
  
> :fire: **Important**   
> If you combine both `only` and `except` properties you have to make sure they are not excluding each other, because denied roles/permissions would not allow access the state for users even if allowed ones would pass them.   

#### Single permission/role 

In simplest cases you allow users having single role permission to access the state. To achieve that you can pass as `String` desired role/permission to only/except property:

```javascript
$stateProvider
  .state('dashboard', {
    url: '...',
    data: {
      permissions: {
        only: 'isAuthorized'
      }
    }
  });
```

In given case when user is trying to access `dashboard` state `StateAuthorization` service is called checking if `isAuthorized` permission is valid looking through PermissionStore and RoleStore for it's definition: 
  - if permission definition is not found it stops transition
  - if permission definition is found but `validationFunction` returns false or rejected promise it stops transition
  - if permission definition is found and `validationFunction` returns true or resolved promise, meaning that user is authorized to access the state transition proceeds to the state

#### Multiple permissions/roles 

Often several permissions/roles are sufficient to allow/deny user to access the state. Then array value comes in handy:  

```javascript
$stateProvider
  .state('userManagement', {
    url: '...',
    data: {
      permissions: {
        only: ['ADMIN','MODERATOR']
      }
    }
  });
```

When `StateAuthorization` service will be called it would expect user to have either `ADMIN` or `MODERATOR` roles to pass him to `userManagement` state.

> :bulb: **Note**   
> Between values in array operator **OR** is used to create alternative. If you need **AND** operator between permissions  define additional `Role` containing set of those. 
 
#### Dynamic access

You can find states that would require to verify access dynamically - often depending on parameters.     

Let's imagine situation where user want to modify the invoice. We need to check every time if he is allowed to do that on state level. We are gonna use `TransitionProperties` object to check weather he is able to do that.

```javascript
$stateProvider
  .state('invoices/:id/:isEditable', {
    url: '...',
    data: {
      permissions: {
        only: function(transitionProperties){
          if(transitionProperties.toParams.isEditable){
            return ['canEdit']
          } else {
            return ['canRead']
          }
        }
      }
    }
  });
```

So whenever we try access state with param `isEditable` set to true additional check for permission `canEdit` will be made. Otherwise only `canRead` will be required.

> :fire: **Important**   
> Notice that function require to always return array of roles/permissions in order to work properly. 

Property redirectTo
----------------------------

Property redirectTo:
  - instructs `StateAuthorization` service how to handle unauthorized access
  - when used as `String` defines single redirection rule
  - when used as `Objects` defines multiple redirection rules
  - when used as `Function` defines dynamic redirection rule(s)

### Single redirection rule

In case you want to redirect to some specific state when user is not authorized pass to `redirectTo` name of that state.

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

> :bulb: **Note**   
> When the state to which user will be redirected is not defined note that he will be intercepted be general `$urlRouterProvider.otherwise()` rule.

### Multiple redirection rules

In some situation you want to redirect user based on denied permission/role to create redirection strategies. In order to do that you have to create redirection `Object` that contain keys representing rejected permissions or roles and values implementing redirection rules.
 
Redirection rules are represented by following values:

| Value type    | Return                     | Usage                                         | 
| :------------ | :------------------------- | :-------------------------------------------- |
| `String`      | `[String]`                 | Simple state transitions                      |
| `Object`      | `[Object]`                 | Redirection with custom parameters or options | 
| `Function`    | `[String|Object]`          | Dynamic properties-based redirection          | 


> :fire: **Important**   
> Remember to define _default_ property that will handle fallback redirect for not defined permissions. Otherwise errors will thrown from either Permission or UI-Router library.

The simplest example of multiple redirection rules are redirection based on pairs role/permission and state. When user is not granted to access the state will be redirected to `agendaList` if missing `canReadAgenda` permission or to `dashboard` when missing `canEditAgenda`. Property `default` is reserved for cases when you want handle specific cases leaving default redirection. 

```javascript
$stateProvider
  .state('agenda', {
    data: {
      permissions: {
        only: ['canReadAgenda','canEditAgenda'],
         redirectTo: {
           canReadAgenda: 'agendaList',
           canEditAgenda: 'dashboard',
           default: 'login'
        }
      }
    }
  })
```

If you need more control over redirection parameters `Object` as a value can be used to customise target state `params` and transition `options`.

```javascript
$stateProvider
  .state('agenda', {
    data: {
      permissions: {
        only: ['canEditAgenda'],
        redirectTo: 
          canEditAgenda: {
            state: 'dashboard',
            params: {
              paramOne: 'one'
              paramTwo: 'two'
            },
            options: {
              location: false
              reload: true
            }
          },
          default: 'login'
        }
      }
    }
  })
```
  
To present usage `redirectTo` as `Object` with values as `Function` in a state definition `agenda` presented below redirection rules are interpreted as:
- when user does not have `canReadAgenda` invoked function returns string representing the state name to which unauthorized user will be redirected
- when user does not have `canEditAgenda` invoked function returns object with custom options and params that will be passed along to transited `dashboard` state

```javascript
$stateProvider
  .state('agenda', {
    data: {
      permissions: {
        only: ['canReadAgenda','canEditAgenda'],
        redirectTo: {
          canReadAgenda: function(transitionParams){
            return 'dashboard';
          },
          canEditAgenda: function(transitionParams){
            return {
              state: 'dashboard',
              params: {
                paramOne: 'one'
              }
            };
          },
          default: 'login'
        }
      }
    }
  })
```

### Dynamic redirection rules

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

> :fire: **Important**   
> Remember to always return _route's state name or object_. Otherwise errors will thrown from either Permission or UI-Router library.

State access inheritance
----------------------------

----------------------------

 **Next to read**: :point_right: [Emitted events](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/3-emitted-events.md) |
| --- |