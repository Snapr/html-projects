/*global _  define require */
define(['config', 'backbone', 'models/photo'], function(config, Backbone, photo_model){

return Backbone.Collection.extend({

    model: photo_model,

    data: {},

    initialize: function(models, options){
        if(options){
            if(options.data){
                this.data = options.data;
            }
            this.exclude = options.exclude;
        }
    },

    url: function( method ){
        return config.get('api_base') + '/search/';
    },

    parse: function( d, xhr ){
        if (d.success && d.response && d.response.photos){

            var photos = d.response.photos;

            if(this.exclude){
                var exclude = this.exclude;
                photos = _.reject(photos, function(photo){
                    return _.contains(exclude, photo.id);
                });

                // more photos may have been grabbed to allow for exclution
                if(this.data.n){
                    photos = _.first(photos, this.data.n);
                }
            }

            return photos;
        }
        else{
            return [];
        }
    },

    fetch: function(options) {
        if(this.exclude && options.data && options.data.n){
            options.data.n += this.exclude.length;
        }
        Backbone.Collection.prototype.fetch.call(this, options);
    },

    fetch_newer: function( options ){
        var data = options.data || {};
        if (this.models.length){
            data.min_date = this.models[0].get('date');
        }
        _.extend( options, {
            add: true,
            data: data
        });
        this.fetch( options );
    },

    fetch_older: function( options ){
        var data = options.data || {};
        if (this.models.length){
            data.paginate_from = this.models[this.length-1].get('id');
        }
        _.extend( options, {
            add: true,
            data: data
        });
        this.fetch( options );
    },

    get_photo_by_id: function( id ){
        return this.filter( function( model ){
            return model.get("id") == id;
        })[0];
    }
});
});
