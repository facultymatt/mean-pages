'use strict';

describe('MEANPages', function() {
    var $httpBackend;
    var $route, $location, $rootScope, $timeout, $templateCache, ngPageMock, $compile, $sce, $parse;
    var mainView;
    var templateCustom, templateDefault;

    beforeEach(module('MEANPages'));
    beforeEach(module('ngRoute'));

    beforeEach(module(function() {

        return function(_$httpBackend_, _$sce_, _$parse_, _$compile_) {

            templateCustom =
                '<nav></nav>' +
                '<h3 ng:area="heading"></h3>' +
                '<h4 ng:area="teaser"></h4>';

            templateDefault =
                '<nav></nav>' +
                '<h1 ng:area="heading"></h1>' +
                '<div ng:area="body1"></div>' +
                '<div ng:area="body2"></div>' +
                '<div ng:area="footer"></div>' +
                '<small ng:area="copyright"></small>';

            $httpBackend = _$httpBackend_;

            $httpBackend.when('GET', 'views/page-custom.html').respond(templateCustom);
            $httpBackend.when('GET', 'views/page-default.html').respond(templateDefault);
        };
    }));

    beforeEach(module(function($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/page-1'
            })
            .when('/page-1', {})
            .when('/page-2', {})
            .when('/page-3', {
                resolve: {
                    "foo": function() {
                        return "bar";
                    }
                }
            })
            .when('/404', {})
            .otherwise({
                redirectTo: '/404'
            })
    }));

    beforeEach(inject(function(_$route_, _$location_, _$rootScope_, _$timeout_, _$templateCache_, _ngPageMock_) {
        $route = _$route_;
        $location = _$location_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $templateCache = _$templateCache_;
        ngPageMock = _ngPageMock_;
    }));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        mainView = $compile('<div><ng:view></ng:view></div>')($rootScope);
    }));


    /**
     * --------------------------------------------
     * Private helper functions
     * --------------------------------------------
     *
     */

    function refresh() {
        $rootScope.$digest();
        $timeout.flush();
        $httpBackend.flush();
    }


    /**
     * --------------------------------------------
     * Routes and resolves
     * --------------------------------------------
     *
     */
    describe('Handle resolves on routes', function() {
        it('should add a resolve to all routes', function() {
            expect(Object.prototype.toString.call($route.routes['/page-1'].resolve)).toEqual('[object Object]');
            expect(Object.prototype.toString.call($route.routes['/page-2'].resolve)).toEqual('[object Object]');
            expect(Object.prototype.toString.call($route.routes['/page-3'].resolve)).toEqual('[object Object]');
        });

        it('should add resolve.page to all routes', function() {
            expect(Object.prototype.toString.call($route.routes['/page-1'].resolve.page)).toEqual('[object Function]');
            expect(Object.prototype.toString.call($route.routes['/page-2'].resolve.page)).toEqual('[object Function]');
            expect(Object.prototype.toString.call($route.routes['/page-3'].resolve.page)).toEqual('[object Function]');
        });

        it('should add resolve.nav to all routes', function() {
            expect(Object.prototype.toString.call($route.routes['/page-1'].resolve.nav)).toEqual('[object Function]');
            expect(Object.prototype.toString.call($route.routes['/page-2'].resolve.nav)).toEqual('[object Function]');
            expect(Object.prototype.toString.call($route.routes['/page-3'].resolve.nav)).toEqual('[object Function]');
        });

        it('should respect existing resolves on routes', function() {
            expect(Object.prototype.toString.call($route.routes['/page-3'].resolve.page)).toEqual('[object Function]');
            expect(Object.prototype.toString.call($route.routes['/page-3'].resolve.nav)).toEqual('[object Function]');
            expect(Object.prototype.toString.call($route.routes['/page-3'].resolve.foo)).toEqual('[object Function]');
        });

        it('should resolve page with page object from api', function() {});
        it('should resolve nav with nav object from api', function() {});

    });


    /**
     * --------------------------------------------
     * Template Caching and loading
     * --------------------------------------------
     *
     */
    describe('Template loading and caching', function() {

        it('should defer loading template until page is loaded', function() {
            $location.path('/page-1');
            $rootScope.$digest();

            // locals and locals.$template are created after
            expect($route.current.locals && $route.current.locals.$template).not.toBeDefined();

            // because we are using a timeout to simulate a delay from our api
            // we need to flush it and clear out all the timeouts!
            $timeout.flush();
            $httpBackend.flush();

            // templates are stored in locals (along with resolves) when loaded
            expect($route.current.locals.$template).toEqual(templateCustom);
        });

        it('should cache templates when loaded for first time', function() {

            expect($templateCache.get('views/page-custom.html')).toBeUndefined();

            $location.path('/page-1');

            refresh();

            expect($templateCache.get('views/page-custom.html')).toEqual(templateCustom);

        });

        it('should load template from cache if cached version exists', function() {

            expect($templateCache.get('views/page-custom.html')).toBeUndefined();
            expect($templateCache.get('views/page-default.html')).toBeUndefined();

            // page 1
            $location.path('/page-1');

            refresh();

            expect($templateCache.get('views/page-custom.html')).toEqual(templateCustom);

            // navigate to a new page, causing a new template to be loaded
            $location.path('/page-2');

            refresh();

            expect($templateCache.get('views/page-default.html')).toEqual(templateDefault);

            $location.path('/page-1');

            expect($templateCache.get('views/page-custom.html')).toEqual(templateCustom);

        });

        it('should load default template if no custom template is defined for page', function() {});

    });


    /**
     * --------------------------------------------
     * PageService
     * --------------------------------------------
     *
     */
    describe('PageService for storing and retrieving pages', function() {

        // this is less behavior driven and more executional? 
        it('should have a set of api methods', function() {
            expect(ngPageMock.currentPage).toBeDefined();
            expect(ngPageMock.currentPage).toEqual(null);

            expect(ngPageMock.currentNav).toBeDefined();
            expect(ngPageMock.currentNav).toEqual(null);

            expect(ngPageMock.getNav).toBeDefined();
            expect(ngPageMock.get).toBeDefined();
            expect(ngPageMock.update).toBeDefined();
            expect(ngPageMock.add).toBeDefined();
            expect(ngPageMock.remove).toBeDefined();
            expect(ngPageMock.getBy).toBeDefined();
            expect(ngPageMock.updateArea).toBeDefined();
        })

        it('should save currentPage in page service', function() {

            expect(ngPageMock.currentPage).toEqual(null);

            $location.path('/page-1');

            refresh();

            // we're not checking for all the object proerties, but just the slug
            // should tell us if we successfully got a page
            expect(ngPageMock.currentPage.hasOwnProperty('slug')).toBe(true);

        });

        it('should save currentNav in page service', function() {

            expect(ngPageMock.currentNav).toEqual(null);

            $location.path('/page-1');

            refresh();

            // we're not checking for all the object proerties, but just the slug
            // should tell us if we successfully got a page
            expect(ngPageMock.currentNav.length).toBeGreaterThan(0);

        });

        it('should render a template', function() {

            $location.path('/page-1');
            refresh();
            console.log(mainView.html());
            //expect(mainView.html()).toEqual(templateCustom);

        })

    });

    /**
     * --------------------------------------------
     *
     * --------------------------------------------
     *
     */
     describe('Directive: area', function() {

        it('should replace element')

     });


});