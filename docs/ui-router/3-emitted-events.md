Emitted events in ui-router
============================

Before start
----------------------------

Make sure you are familiar with:
- [Installation guide for ui-router](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/1-installation.md)
- [Usage in ui-router states](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/2-usage-in-states.md)
- [Managing permissions](https://github.com/Narzerus/angular-permission/blob/development/docs/1-manging-permissions.md)   
- [Manging roles](https://github.com/Narzerus/angular-permission/blob/development/docs/2-manging-roles.md)   

Overview
----------------------------

1. [Event $stateChangePermissionStart](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/4-transition-properties.md#statechangepermissionstart)
2. [Event $stateChangePermissionAccepted](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/4-transition-properties.md#statechangepermissionaccepted)
3. [Event $stateChangePermissionDenied](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/4-transition-properties.md#statechangepermissiondenied-)

$stateChangePermissionStart
----------------------------

Event broadcasted before start of authorizing.

```javascript
$rootScope.$on('$stateChangePermissionStart', function(event, toState, toParams, options) { ... });
```

$stateChangePermissionAccepted
----------------------------

Event broadcasted when one of the permissions has been accepted and the state changes successfully.

```javascript
$rootScope.$on('$stateChangePermissionAccepted', function(event, toState, toParams, options) { ... });
```

$stateChangePermissionDenied 
----------------------------

Event broadcasted when the access to the target state is not granted.

```javascript
$rootScope.$on('$stateChangePermissionDenied', function(event, toState, toParams, options) { ... });
```

----------------------------

| **Next to read**: :point_right: [Transition properties](https://github.com/Narzerus/angular-permission/blob/development/docs/ui-router/4-transition-properties.md) |
| --- |
