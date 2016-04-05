(function() {
    "use strict";
    
    var common = angular.module("common", []);
    
    common.config(["$httpProvider", function($httpProvider) {
        // Allow through any response that is in the expected API format.
        $httpProvider.interceptors.push(["$q", function($q) {
            return {
                responseError: function(rejection) {
                    if ("object" !== typeof(rejection.data) || !rejection.data.hasOwnProperty("success"))
                        return $q.reject(rejection);
                    
                    return rejection;
                }
            };
        }]);
    }]);
}());