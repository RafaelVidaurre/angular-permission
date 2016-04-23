TransitionProperties object in ui-router
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

TransitionProperties object is angular `Value` structure that if used with ui-router holds properties of the state transition inherited form `$stateChangeStart` event. It can met as parameter in all programmatic available methods in Permission module like: state access `only` and `except`, `redirectTo` used as functions or Permission events where some of the properties are exposed. All of the properties of TransitionProperties are described in the table below:

| Value type    |  Usage                         | 
| :------------ | :----------------------------- |
| `toState`     | Target state definition object |
| `toParams`    | Target state parameters object |
| `formState`   | Source state definition object |
| `fromParams`  | Source state parameters object | 
| `options`     | Transition options             | 


> :bulb: **Note**   
> As all the values passed to TransitionProperties are references to it's original values modification of those is not recommended, because may lead to unpredictable behaviour of ui-router. 