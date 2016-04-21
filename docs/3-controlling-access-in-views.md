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