/*global _  define require */
define(['config', 'backbone'], function(config, Backbone){
return  Backbone.Model.extend({

    url: function( method ) {
        return config.get('api_base') + '/spots/';
    },

    parse: function( d, xhr ) {
        if (d.success && d.response && d.response.spots) {
            return d.response.spots[0];
        }
        else if (d.id) {
            return d;
        }
        else {
            return {};
        }
    },

    // try removing this, the api should be updated to cope without it
    sync: function(method, model, options){
        options.data = _.extend(options.data || {}, {spot_id: model.id});
        return Backbone.sync.call(this, method, model, options);
    }

});
});
