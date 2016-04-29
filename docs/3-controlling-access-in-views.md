Controlling access in views
============================

Before start
----------------------------

Make sure you are familiar with:
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)
- [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)   

Overview
----------------------------

1. [Permission directive]()
  1. [Basic usage]()
  1. [Custom behaviour]()
2. [Async calls for permissions in initial state]()

Permission directive
----------------------------
  
Permission module exposes directive `permission` that can show/hide elements of your application based on set of permissions.

Permission directive accepts several attributes:

| Attribute                    | Value                | Description                                                     | 
| :--------------------------- | :-----------------   | :-------------------------------------------------------------- |
| `permission-only`            | [`String` | `Array`] | Single or multiple roles/permissions allowed to access content  |
| `permission-except`          | [`String` | `Array`] | Single or multiple roles/permissions denied to access content   |
| `permission-on-authorized`   | [`Function`]         | Custom function invoked when authorized                         |
| `permission-on-unauthorized` | [`Function`]         | Custom function invoked when authorized                         |

### Basic usage

Directives accepts either single permission that has to be met in order to display it's content:
 
```html
<div permission only="'loggedIn'">
  <span>Congrats! You are logged in.</span>  
</div>
```

Or set of permissions separated by 'coma':

```html
<div permission except="['USER','ADMIN']">
  <span>You are not 'ADMIN' nor 'USER'.</span>  
</div>
```

### Customizing behaviour


Async calls for permissions in initial states
----------------------------

When using async calls to fetch permissions in initial states make sure that modules (or app) are waiting for permissions to be resolved before running them. To ensure that you should create global variable e.g. `appReady` that will disable rendering of top level ui-view that is responsible for triggering start of your router.  
   
```html
[index.html]
<div ui-view="root" ng-if="appReady"><div>
```

And in app module: 

```js
 var app = ng.module('app', ['permission']);
 
 app.run(function($rootScope){
    // Example ajax call
    $http
      .get('/permissions')
      .then(function(permissions){
        // Use RoleStore and PermissionStore to define permissions and roles 
        // or even set up whole session
      })
      .then(function(permissions){
        // Kick-off router and start the application
        $rootScope.appReady = true;
      })
 })
```
----------------------------

| **Next to read**: :point_right: [Installation guide for ui-router](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/1-installation.md) |
| --- |

| **Next to read**: :point_right: [Installation guide for ng-route](https://github.com/Narzerus/angular-permission/blob/development/docs/ng-route/1-installation.md) |
| --- |