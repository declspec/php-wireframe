(function() {
    "use strict";
    
    var common = angular.module("common", []);
    
    common.config(["$provide", "$httpProvider", function($provide, $httpProvider) {
        $provide.constant("$user", window.user || null);
        
        // Allow through any response that is in the expected API format.
        // also redirect the user when an unauthorized error comes through
        $httpProvider.interceptors.push(["$q", "$window", function($q, $window) {
            return {
                responseError: function(rejection) {
                    if ("object" !== typeof(rejection.data) || !rejection.data.hasOwnProperty("success"))
                        return $q.reject(rejection);
                    
                    if (rejection.data.status !== 401)
                        return rejection;
                    
                    // If it's an 'Unauthorized' error then it may be due to the user's access token expiring.
                    // redirect them to the login page.
                    var target = $window.location.pathname + $window.location.search;
                    $window.location.href = "/auth/login?return=" + target.split("/").map(encodeURIComponent).join("/");
                    return $q.reject(rejection);
                }
            };
        }]);
    }]);
}());