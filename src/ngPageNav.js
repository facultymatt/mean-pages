/**
 * Directive to assemble a simple nav from
 *
 */
angular
    .module('ngPage')
    .directive('nav', ['ngPageMock',
        function(ngPageMock) {

            var template = '<ul>' +
                '<li ng-repeat="page in pages">' +
                '<a ng-href="#/{{page.slug}}" title="{{page.slug}}">{{page.slug}}</a>' +
                '</li>' +
                '</ul>';

            return {
                restrict: 'AE',
                replace: true,
                template: template,
                link: function(scope, element, attrs, ctrl) {

                    // creates a local ref to pages
                    // @note this works because the template compile is postponed
                    // untill our PageService resolves. If using nav outside ng-view
                    // we'll need to build this out
                    scope.pages = ngPageMock.currentNav;
                    console.log(scope.pages);

                }
            }

        }
    ])
