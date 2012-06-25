/*global _  define require */
define(['backbone', 'routers'], function(Backbone, routers){
    return function(fragment, extra_data){
        return _.any(routers.prototype.urls, function(url) {
            if (url.regex.test(fragment)) {
                console.log('extract', url.regex, fragment);
                var options = Backbone.Router.prototype._extractParameters(url.regex, fragment)[0];
                url.callback(options, 'dialog', extra_data);
                return true;
            }
        });
    };
});
