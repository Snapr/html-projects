/*global _ Route define require */
define([], function(){
    return function(fragment, extra_data){
        return _.any(Route.routes, function(callback, route) {
            route = Route._routeToRegExp(route);
            if (route.test(fragment)) {
                var options = Route._extractParameters(route, fragment)[0];
                Route[callback](options, 'dialog', extra_data);
                return true;
            }
        });
    };
});
