'use strict';



describe('MEANPages', function() {
    var $httpBackend;
    var $route, $location, $rootScope, $timeout, $templateCache, pageService, $compile;
    var mainView;
    var templateCustom, tempalteDefault;

    beforeEach(module('MEANPages'));
    beforeEach(module('ngRoute'));

    beforeEach(module(function() {

        templateCustom    = '<nav></nav>' +
                            '<h3 area="heading"></h3>' +
                            '<h4 area="teaser"></h4>';

        tempalteDefault   = '<nav></nav>' +
                            '<h1 area="heading"></h1>' +
                            '<div area="body1"></div>' +
                            '<div area="body2"></div>' +
                            '<div area="footer"></div>' +
                            '<small area="copyright"></small>';

        return function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $httpBackend.when('GET', 'views/page-custom.html').respond({data: templateCustom});
            $httpBackend.when('GET', 'views/page-default.html').respond({data: tempalteDefault});
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

    beforeEach(inject(function(_$route_, _$location_, _$rootScope_, _$timeout_, _$templateCache_, _pageService_) {
        $route = _$route_;
        $location = _$location_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        $templateCache = _$templateCache_;
        pageService = _pageService_;
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
            expect($route.current.locals.$template).toEqual({ data : templateCustom});
        });

        it('should cache templates when loaded for first time', function() {

            expect($templateCache.get('views/page-custom.html')).toBeUndefined();

            $location.path('/page-1');

            refresh();

            expect($templateCache.get('views/page-custom.html')).toEqual({ data : templateCustom});

        });

        it('should load template from cache if cached version exists', function() {

            expect($templateCache.get('views/page-custom.html')).toBeUndefined();
            expect($templateCache.get('views/page-default.html')).toBeUndefined();

            // page 1
            $location.path('/page-1');

            refresh();

            expect($templateCache.get('views/page-custom.html')).toEqual({ data : templateCustom});

            // navigate to a new page, causing a new template to be loaded
            $location.path('/page-2');

            refresh();

            expect($templateCache.get('views/page-default.html')).toEqual({ data : tempalteDefault });

            $location.path('/page-1');

            expect($templateCache.get('views/page-custom.html')).toEqual({ data : templateCustom});

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
            expect(pageService.currentPage).toBeDefined();
            expect(pageService.currentPage).toEqual(null);

            expect(pageService.currentNav).toBeDefined();
            expect(pageService.currentNav).toEqual(null);

            expect(pageService.getNav).toBeDefined();
            expect(pageService.get).toBeDefined();
            expect(pageService.update).toBeDefined();
            expect(pageService.add).toBeDefined();
            expect(pageService.remove).toBeDefined();
            expect(pageService.getBy).toBeDefined();
            expect(pageService.updateArea).toBeDefined();
        })

        it('should save currentPage in page service', function() {

            expect(pageService.currentPage).toEqual(null);

            $location.path('/page-1');

            refresh();

            // we're not checking for all the object proerties, but just the slug
            // should tell us if we successfully got a page
            expect(pageService.currentPage.hasOwnProperty('slug')).toBe(true);

        });

        it('should save currentNav in page service', function() {

            expect(pageService.currentNav).toEqual(null);

            $location.path('/page-1');

            refresh();

            // we're not checking for all the object proerties, but just the slug
            // should tell us if we successfully got a page
            expect(pageService.currentNav.length).toBeGreaterThan(0);

        });

        it('should be nice', function() {

            $location.path('/page-1');
            refresh();
            console.log(mainView.html());



        })

    });

    /**
     * --------------------------------------------
     *
     * --------------------------------------------
     *
     */

});