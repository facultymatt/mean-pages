angular
    .module('app', ['ngResource', 'ngRoute', 'ngPage'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/page-1'
            })
            .when('/page-1', {})
            .when('/page-2', {})
            .when('/page-3', {})
            .when('/404', {})
            .otherwise({
                redirectTo: '/404'
            })

    });
