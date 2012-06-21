/*global _  define require */
define(['config', 'backbone', 'models/linked_service', 'auth'], function(config, Backbone, linked_service, auth){

var user_settings_cache;

return  Backbone.Model.extend({

    initialize: function(){
        function cache_bust(){
            user_settings_cache = false;
        }
        this.bind('change', cache_bust);
        auth.bind('change', cache_bust);
    },

    urlRoot: function(){
        return config.get('api_base') + '/user/';
    },

    url: function( method ){
        if (method){
            switch (method){
                case 'create':
                    return this.urlRoot() + 'signup/';
                case 'update':
                    return this.urlRoot() + 'settings/';
                default:
                    this.data = _.extend( this.data || {}, {linked_services: true } );
                    return this.urlRoot() + 'settings/';
            }
        }else{
            return this.urlRoot();
        }
    },

    sync: function(method, model, options) {
        if(method == 'read'){
            var success = options.success;
            options.success = function(data, status, xhr){
                success(data, status, xhr);
                user_settings_cache = data;
            };
            if(user_settings_cache){
                options.success(user_settings_cache);
                return;
            }
        }
        Backbone.sync.call(this, method, model, options);
    },

    parse: function( d, xhr ){
        if (d.success && d.response){
            return d.response;
        }else if (d.success){
            // for new signups just return an empty object
            return {};
        }
    },

    linked_services_setup: function(){

        var linked_services = this.get('linked_services');
        var ls = [];
        _.each( linked_services, function( service, key ){
            // create a new linked_service model for each linked service
            var linked = new linked_service( service );
            // set the provider so we know which url to hit if we want to make changes
            linked.provider = key;
            // remove the 'lined_services' data added above as we no longer need it
            delete linked.data;
            ls.push( linked );
        });
        // remove the linked_services object and replace it with our new models
        this.unset('linked_services');
        this.set({
            linked_services: ls
        });
    }
});
});
