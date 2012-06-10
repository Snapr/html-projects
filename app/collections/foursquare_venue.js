/*global _ Route define require */
define(['backbone', 'models/foursquare_venue'], function(Backbone, foursquare_venue){
return Backbone.Collection.extend({

    initialize: function( init_options ){
        if (init_options.location){
            this.data = {
                v: "20110609",
                intent: "checkin",
                ll: init_options.location.latitude + ',' + init_options.location.longitude
            };
        }
        if (init_options.ll){
            this.data = {
                v: "20110609",
                intent: "checkin",
                ll: init_options.ll
            };
        }

    },

    model: foursquare_venue,

    url: function( method ){
        return snapr.api_base + '/linked_services/foursquare/venues/';
    },

    parse: function( d, xhr ){
        try{
            return d.response.foursquare_response.response.venues;
        }catch(e){
            return [];
        }
    }
});
});
