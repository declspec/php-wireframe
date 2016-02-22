angular.module("common").service("$httpq", [ "$http", "$q",
    function($http, $q) {
        "use strict";
        
        this.get = wrap("get");
        this.put = wrap("put");
        this.post = wrap("post");
        this.delete = wrap("delete");
        
        function wrap(method) {
            var fn = $http[method];

            return function () {
                var deferred = $q.defer();
                fn.apply($http, arguments)
                    .success(deferred.resolve)
                    .error(deferred.reject);
                return deferred.promise;
            }
        };
    }
]);