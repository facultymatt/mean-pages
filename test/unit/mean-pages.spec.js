'use strict';

// @todo move mock to the tests

describe('ngPage', function() {
    var $httpBackend;
    var $route, $location, $rootScope, $timeout, $templateCache, ngPageMock, $compile, $sce, $parse;
    var mainView;
    var templateCustom, templateDefault, templateTools;

    beforeEach(module('ngPage'));
    beforeEach(module('ngRoute'));

    beforeEach(module(function() {

        return function(_$httpBackend_, _$sce_, _$parse_, _$compile_) {

            templateCustom =
                '<nav></nav>' +
                '<div ng:area="heading"></div >' +
                '<div ng:area="teaser"></div >';

            templateDefault =
                '<nav></nav>' +
                '<div ng:area="heading"></div >' +
                '<div ng:area="body1"></div>' +
                '<div ng:area="body2"></div>' +
                '<div ng:area="footer"></div>' +
                '<div ng:area="copyright"></div >';

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
    describe('Template loading', function() {

        describe('infers template from page data', function() {

            beforeEach(function() {
                $location.path('/page-1');
                $rootScope.$digest();
            })

            it('page is not yet loaded', function() {
                expect($route.current.locals && $route.current.locals.page).not.toBeDefined();
            });

            it('template is not yet loaded', function() {
                expect($route.current.locals && $route.current.locals.$template).not.toBeDefined();
            });

            it('resolves page', function() {
                $timeout.flush();
                $httpBackend.flush();
                expect($route.current.locals.page.id).toEqual(1);
            });

            it('resolves template', function() {
                $timeout.flush();
                $httpBackend.flush();
                expect($route.current.locals.$template).toEqual(templateCustom);
            });

        });

    });

    describe('Template caching', function() {

        describe('initial caching', function() {

            it('should start with an empty cache', function() {
                expect($templateCache.get('views/page-custom.html')).toBeUndefined();
                expect($templateCache.get('views/page-default.html')).toBeUndefined();
            });
        });

        describe('caching as user navigates app', function() {

            beforeEach(function() {
                $location.path('/page-1');
                refresh();
            });

            it('should cache templates when loaded for first time', function() {
                expect($templateCache.get('views/page-custom.html')).toEqual(templateCustom);
            });

            it('should load template from cache if cached version exists', function() {
                // navigate to a new page, causing a new template to be loaded
                $location.path('/page-2');
                refresh();
                $location.path('/page-1');
                expect($templateCache.get('views/page-custom.html')).toEqual(templateCustom);
            });
        });

    });

    describe('Default template', function() {
        it('should load default template if no custom template is defined for page', function() {});
    });


    /**
     * --------------------------------------------
     * PageService
     * --------------------------------------------
     *
     */
    describe('pageMock for demos and simulating database persistence', function() {

        // this is less behavior driven and more executional? 
        it('should provide a set of api methods', function() {

            expect(ngPageMock.currentPage).toEqual(null);
            expect(ngPageMock.currentNav).toEqual(null);

            expect(ngPageMock.getNav).toBeDefined();
            expect(ngPageMock.get).toBeDefined();
            expect(ngPageMock.update).toBeDefined();
            expect(ngPageMock.add).toBeDefined();
            expect(ngPageMock.remove).toBeDefined();
            expect(ngPageMock.getBy).toBeDefined();
            expect(ngPageMock.updateArea).toBeDefined();

        });

        describe('store current page', function() {

            it('currentPage should default to null', function() {
                expect(ngPageMock.currentPage).toBe(null);
            });

            it('should update current page on location change', function() {
                $location.path('/page-1');
                refresh();
                expect(ngPageMock.currentPage.slug).toBe('page-1');
            });

        });

        describe('store current nav ', function() {

            it('currentNav defaults to null', function() {
                expect(ngPageMock.currentNav).toEqual(null);
            });

            it('stores nav when nav is first retrieved', function() {
                $location.path('/page-1');
                refresh();
                expect(ngPageMock.currentNav.length).toBeGreaterThan(0);
            });

        });

    });

    /**
     * --------------------------------------------
     *
     * --------------------------------------------
     *
     */
    describe('Directives', function() {

        describe('area', function() {

            beforeEach(function() {
                templateTools =
                    '<nav></nav>' +
                    '<div id="teaser1" area="teaser1" tools="h1, h2, h3 | pre"></div>' +
                    '<div id="teaser2" area="teaser1" tools="h1, h2, h3 | pre | ol, ul"></div>' +
                    '<div id="teaser3" area="teaser2" tools="h1"></div>' +
                    '<div id="teaser4" area="teaser3" tools="h1||,"></div>';

                $httpBackend.when('GET', 'views/page-tools.html').respond(templateTools);
            });

            describe('provides edit and view interface', function() {

                it('defaults to view mode', function() {});

                it('can enter edit mode by clicking on element', function() {});

                it('can enter edit mode by clicking edit button', function() {});

                describe('clicking save changes', function() {

                    it('persists changes to database', function() {});

                });

                describe('clicking cancel', function() {

                    it('discards changes to model', function() {});

                });

            });

            describe('renders textAngular editor in edit mode', function() {

                it('renders textAnguler editor', function() {});

                iit('sets custom toolbar', function() {
                    $location.path('/page-3');
                    refresh();
                    var teaser1 = mainView.find('#teaser1');
                    var teaser2 = mainView.find('#teaser2');
                    var teaser3 = mainView.find('#teaser3');
                    var teaser4 = mainView.find('#teaser4');
                    teaser1.click();
                    teaser2.click();
                    teaser3.click();
                    //teaser4.click();
                    $rootScope.$digest();
                    var tools1 = teaser1.find('[ta-toolbar]').attr('ta-toolbar');
                    var tools2 = teaser2.find('[ta-toolbar]').attr('ta-toolbar');
                    var tools3 = teaser3.find('[ta-toolbar]').attr('ta-toolbar');
                    var tools4 = teaser4.find('[ta-toolbar]').attr('ta-toolbar');
                    
                    expect(tools1).toBe("[['h1','h2','h3'],['pre']]");
                    expect(tools2).toBe("[['h1','h2','h3'],['pre'],['ol','ul']]");
                    expect(tools3).toBe("[['h1']]");
                    //expect(tools4).toBe("[['h1','h2','h3'],['pre']]");
                });

                it('parses custom toolbar syntax to work with textAngular', function() {});

            });

        });

        describe('nav', function() {

            describe('renders list of pages as navigation', function() {

                it('shows all pages in list', function() {});

                it('links to each page by slug', function() {});

            });

        });

    });

});
