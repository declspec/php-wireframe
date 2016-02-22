angular.module("common").service("StaticService", [ "$q",
    function($q) {
        "use strict";
        
        var regions = [
            { code: "oce", display: "Oceania" },
            { code: "na", display: "North America" },
            { code: "euw", display: "Europe (West)" },
            { code: "eune", display: "Europe (Nordic & East)" },
            { code: "kr", display: "Korea" },
            { code: "las", display: "Latin America South" },
            { code: "lan", display: "Latin America North" }
        ];
        
        this.getRegions = function() {
            return $q.when(regions);
        };
    }
]);