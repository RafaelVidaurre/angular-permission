Emitted events in angular-route
============================

Before start
----------------------------

Make sure you are familiar with:
- [Installation guide for angular-route](https://github.com/Narzerus/angular-permission/blob/development/docs/ng-route/1-installation.md)
- [Usage in angular-route routes](https://github.com/Narzerus/angular-permission/blob/development/docs/ng-route/2-usage-in-routes.md)
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)   
- [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)   


Overview
----------------------------

1. [Event $stateChangePermissionStart](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/4-transition-properties.md#statechangepermissionstart)
2. [Event $stateChangePermissionAccepted](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/4-transition-properties.md#statechangepermissionaccepted)
3. [Event $stateChangePermissionDenied](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/4-transition-properties.md#statechangepermissiondenied-)

$routeChangePermissionStart
----------------------------

Event broadcasted before start of authorizing.

```javascript
$rootScope.$on('$routeChangePermissionStart',
function(event, nextRoute) { ... });
```

$routeChangePermissionAccepted
----------------------------

Event broadcasted when one of the permissions has been accepted and the route changes successfully.

```javascript
$rootScope.$on('$routeChangePermissionAccepted', function(event, nextRoute) { ... });
```

$routeChangePermissionDenied 
----------------------------

Event broadcasted when the access to the target route is not granted.

```javascript
$rootScope.$on('$routeChangePermissionDenied', function(event, nextRoute) { ... });
```

----------------------------

| **Next to read**: :point_right: [Transition properties](https://github.com/Narzerus/angular-permission/blob/development/docs/ng-route/4-transition-properties.md) |
| --- |
