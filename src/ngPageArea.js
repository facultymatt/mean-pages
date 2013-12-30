/**
 * Directive to define "areas" of editable and database persisting content
 *
 */
angular
    .module('ngPage')
    .directive('area', ['ngPageInterface', '$compile',
        function(ngPageInterface, $compile) {

            // parses current page to return content area given a slug
            // if no content area is found, will create an empty content area 
            // with slug name and return
            // this basically creates a new slug for areas with no prior content
            // in the database
            function getAreaContentFromSlug(slug) {
                var area;
                if (ngPageInterface.currentPage && ngPageInterface.currentPage.areas) {
                    area = _.findWhere(ngPageInterface.currentPage.areas, {
                        "slug": slug
                    });
                }
                return area && area.slug ? area : {
                    slug: slug,
                    content: ''
                };
            }

            // ------------------------------
            // Parse tool string to remove invalid tools, characters, and 
            // to match the textAngular format of array structure.
            // While array structure makes sense for rendering the tools in code
            // its not very user friendly for setting in development. 
            // 
            // this parsing function allows the dev to use a familiar syntax
            // and then converts it to work with textAngular
            // 
            // @todo this could be a PR on textAngular itself
            // this is needed because sending the wrong syntax will throw an 
            // error. textAngular is very finicky when it comes to this. 
            // ------------------------------
            // 
            // @param tools string Sting of tools to parse
            // @return string Parsed string OR empty string '' if not valid
            //

            function parseTools(tools) {

                // tools supported by textAngular
                var options = ['h1', 'h2', 'h3', 'p', 'pre', 'quote',
                    'bold', 'italics', 'undeline', 'ul', 'ol', 'redo',
                    'undo', 'clear', 'justifyLeft', 'justifyRight',
                    'justifyCenter', 'html', 'insertImage',
                    'insertLink', 'unlink'
                ];

                // Regexp will match any tools NOT IN the options array
                // also adds comma `,` and vertical line `|` to matcher
                var invalidTools = new RegExp('\\b(?!' +
                    options.join('|') +
                    '|,|\\|)\\w+\\b', 'g');

                // remove invalid tools
                tools = tools.replace(invalidTools, '');

                // clean up formatting issues that might be caused by removing
                // invalid tools. Then, wrap in array structure for textAngular
                var parsed = tools
                    .replace(/\|,+/g, '') // remove |,
                .replace(/,\|+/g, '') // remove ,|
                .replace(/\|+/g, '|') // ensure single |
                .replace(/\s/g, '') // remove spaces
                .replace(/(^[\s|,|\|]+|[\s|,|\|]+$)/g, '') // remove leading and trailing , |
                .replace(/[^|]+/g, '[$&]') // wrap groups between | in []
                .replace(/[|]/g, ',') // change | to ,
                .replace(/[a-zA-Z0-9]+/g, '\'$&\'') // wrap tags in ''
                .replace(/\[.+\]/g, '[$&]'); // wrap everything in []

                // another test to make sure that at least 1 valid 
                // tool exists. This is the same as above regex 
                // but instead matches that ARE IN the array
                test = new RegExp('\\b(' +
                    options.join('|') +
                    '|,|\\|)\\b', 'g');
                var oneOrMoreValidTools = parsed.match(test) ? true : false;

                return oneOrMoreValidTools ? parsed : '';
            }

            return {
                restrict: 'A',
                scope: true,
                compile: function compile(elem, attr) {

                    // @todo move elsewhere! 
                    var editTemplate = '<span class="ng-page-area"><a class="btn btn-default ng-page-edit-btn"><i class="fa fa-eye" ng-click="edit(false)"></i></a><span text-angular ng-model="area.content" ta-toolbar="{{tools}}"></span></span>';
                    var viewTemplate = '<span class="ng-page-area"><a class="btn btn-default ng-page-edit-btn"><i class="fa fa-pencil-square-o" ng-click="edit(true)"></i></a><span ng-bind-html="area.content" ta-toolbar="{{tools}}"></span></span>';

                    return {
                        pre: function(scope, elem, attrs) {

                            // get area from currentPage
                            // if no area exists, we create a blank area
                            scope.area = getAreaContentFromSlug(attrs.area);

                            // check for custom toolbar 
                            scope.tools = parseTools(attrs.tools);

                        },
                        post: function postLink(scope, element, attr) {

                            // watch content change and save right away
                            // @todo decide if we want to require user to
                            // click save.
                            // @note this currently makes api call for every
                            // single character user types. Resource heavy
                            scope.$watch('area.content', function(newValue) {
                                ngPageInterface.updateArea(ngPageInterface.currentPage.id, scope.area);
                            });

                            // function to set elements html
                            // with edit OR view template
                            // based on shouldEdit boolean. 
                            scope.edit = function(shouldEdit) {

                                // choose edit or view template
                                var template = shouldEdit ? editTemplate : viewTemplate;
                                template = angular.element(template);

                                // compile and appended to element
                                element.empty().append($compile(template)(scope));

                                // if we are viewing bind to click 
                                // on element which renders edit template 
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

                }

            }

        }
    ]);
