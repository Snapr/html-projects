/*global _  define require */
define(['config', 'backbone', 'models/photo'], function(config, Backbone, photo_model){

return Backbone.Collection.extend({

    model: photo_model,

    data: {},

    url: function( method )
    {
        return config.get('api_base') + '/search/';
    },

    parse: function( d, xhr )
    {
        if (d.success && d.response && d.response.photos)
        {
            return d.response.photos;
        }
        else
        {
            return [];
        }
    },
    fetch_newer: function( options )
    {
        var data = {};
        if (this.models.length)
        {
            data.min_date = this.models[0].get('date');
        }
        _.extend( options, {
            add: true,
            data: data
        });
        this.fetch( options );
    },

    fetch_older: function( options )
    {
        var data = {};
        if (this.models.length)
        {
            data.paginate_from = this.models[this.length-1].get('id');
        }
        _.extend( options, {
            add: true,
            data: data
        });
        this.fetch( options );
    },

    get_photo_by_id: function( id )
    {
        return this.filter( function( model )
        {
            return model.get("id") == id;
        })[0];
    }
});
});
