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