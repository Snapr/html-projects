/*global _  define require */
define(['routers'], function(routers){
    return function(fragment, extra_data){
        return _.any(routers.routers_instance.routes, function(callback, route) {
            route = routers.routers_instance._routeToRegExp(route);
            if (route.test(fragment)) {
                var options = routers.routers_instance._extractParameters(route, fragment)[0];
                routers.routers_instance[callback](options, 'dialog', extra_data);
                return true;
            }
        });
    };
});
