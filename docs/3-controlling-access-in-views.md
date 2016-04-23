Controlling access in views
============================

Make sure you are familiar with:
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)
- [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)   

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

----------------------------

| **Next to read**: :point_right: [Installation guide for ui-router](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/1-installation.md) |
| --- |

| **Next to read**: :point_right: [Installation guide for ng-route](https://github.com/Narzerus/angular-permission/blob/development/docs/ng-route/1-installation.md) |
| --- |