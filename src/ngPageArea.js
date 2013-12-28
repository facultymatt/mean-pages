/**
 * Directive to define "areas" of editable and database persisting content
 *
 */
angular
    .module('ngPage')
    .directive('area', ['ngPageMock', '$compile',
        function(ngPageMock, $compile) {

            // parses current page to return content area given a slug
            // if no content area is found, will create an empty content area 
            // with slug name and return
            // this basically creates a new slug for areas with no prior content
            // in the database
            function getAreaContentFromSlug(slug) {
                var area;
                if (ngPageMock.currentPage && ngPageMock.currentPage.areas) {
                    area = _.findWhere(ngPageMock.currentPage.areas, {
                        "slug": slug
                    });
                }
                return area && area.slug ? area : {
                    slug: slug,
                    content: ''
                };
            }

            return {
                restrict: 'A',
                scope: true,
                compile: function compile(elem, attr) {

                    var editTemplate = '<span class="ng-page-area"><a class="btn btn-default ng-page-edit-btn"><i class="fa fa-eye" ng-click="edit(false)"></i></a><span text-angular ng-model="area.content"></span></span>';
                    var viewTemplate = '<span class="ng-page-area"><a class="btn btn-default ng-page-edit-btn"><i class="fa fa-pencil-square-o" ng-click="edit(true)"></i></a><span ng-bind-html="area.content"></span></span>';

                    return {
                        pre: function(scope, elem, attrs) {
                            scope.area = getAreaContentFromSlug(attrs.area);

                            // generate template based on user auth
                            //var template = angular.element('<span>matt</span>');

                            // add compiled template to our element
                            //elem.replaceWith($compile(template)(scope));
                        },
                        post: function postLink(scope, element, attr) {

                            // element.on('blur keyup paste', function (event) {
                            //     scope.area.content = element[0].innerHTML;
                            //     ngPageMock.updateArea(scope.area);
                            // });
                            scope.$watch('area.content', function(newValue) {
                                ngPageMock.updateArea(scope.area);
                            });

                            // function to set elements html
                            // with and edit OR view template
                            // based on shouldEdit boolean. 
                            scope.edit = function(shouldEdit) {
                                var template = shouldEdit ? editTemplate : viewTemplate;
                                template = angular.element(template);
                                element.empty().append($compile(template)(scope));

                                // in addition if we are viewing bind to click 
                                // on element
                                if (!shouldEdit) {
                                    template.on('click', function() {
                                        scope.edit(true);
                                    })
                                }
                            };

                            // start initial state in view mode
                            scope.edit(false);

                        }
                    }

                    // we check attrs bind to prevent infinate loop
                    // @todo can we move this to compile? 
                    // if (!attrs.ngBindHtml) {
                    //     element.attr('ng-bind-html', 'content');
                    //     $compile(element)(scope);
                    // }


                    //text-angular ng-model="heading" ta-toolbar="[['h1']]"

                    // rough watch for change within the element
                    // @note when we make this more robust, adding wysiwyg editor etc 
                    //       we'll get the new data in a much more robust way. 
                    //       for now we just watch for change events and update the service
                    //       on change
                    //
                    // element.on('blur keyup paste', function (event) {
                    //     scope.area.content = element[0].innerHTML;
                    //     ngPageMock.updateArea(scope.area);
                    // });

                    // // set content within this scope
                    // scope.area = getAreaContentFromSlug(attrs.area);
                    // scope.content = scope.area.content;

                }

            }

        }
    ])
