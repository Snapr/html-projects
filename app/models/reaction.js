/*global _  define require */
define(['backbone', 'auth'], function(Backbone, auth){ return Backbone.Model.extend({
     parse: function( d, xhr ){
        console.log(d);
        d.display_username = auth.fill_username(d);
        return d;
    }
}); });
