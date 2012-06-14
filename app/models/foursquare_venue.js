/*global _  define require */
define(['backbone'], function(Backbone){
return  Backbone.Model.extend({

    url: function( method )
    {
        return snapr.api_base + '/linked_services/foursquare/venues/';
    },

    parse: function( d, xhr )
    {
        if (d.response &&
            d.response.foursquare_response &&
            d.response.foursquare_response.response &&
            d.response.foursquare_response.response.venues)
        {
            return d.response.foursquare_response.response.venues;
        }
        else if (d.id)
        {
            return d;
        }
        else
        {
            return [];
        }
    }

});
});
