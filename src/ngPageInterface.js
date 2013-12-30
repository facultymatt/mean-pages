/**
 * Service that returns Mock data as promises to simulate a database call
 *
 */

// @note this mock can be a template for any adapter
// for example we could just replace all the mocks with resource calls
// or firebase calls. 

// @todo move mock to separate mock file and keep this to functions


/**
 * --------------------------------------------
 * Interface for saving and getting pages and navigation
 * --------------------------------------------
 *
 * Users can define project specific integrations for different apis
 * for example if using firebase or express node apps.
 *
 * The page module itself will always communicate to the
 * and the interface will then call the integrations
 *
 */

angular
    .module('ngPage')
    .factory('ngPageInterface', ['ngPageIntegrationsMock',
        function(integration) {

            // create and expose service methods
            var exports = {};

            // cache items to access in our page directives
            exports.currentPage = null;
            exports.currentNav = null;

            // hook functions into current integration
            exports.getNav = function() {
                return integration.getNav().then(function(response) {
                    exports.currentNav = response;
                    return response;
                });
            };
            exports.get = integration.get;
            exports.update = integration.update;
            exports.add = integration.add;
            exports.remove = integration.remove;
            exports.getBy = function(key, value) {
                return integration.getBy(key, value).then(function(response) {
                    exports.currentPage = response;
                    return response;
                });
            };
            exports.updateArea = integration.updateArea;

            return exports;

        }
    ])
