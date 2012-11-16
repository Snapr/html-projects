/*global _  define require */
define(['config', 'backbone', 'models/photo'], function(config, Backbone, photo_model){

return Backbone.Collection.extend({

    model: photo_model,

    defaults: {
        sort: config.get('sort_order')
    },

    initialize: function(models, options){
        if(options){
            this.data = _.defaults(options.data || {}, this.defaults);
            this.exclude = options.exclude;
        }
        if(config.has('min_photo_rating')){
            this.defaults.min_rating = config.get('min_photo_rating');
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
        options = options || {};
        options.data = _.defaults(options.data || {}, this.defaults);
        if(this.exclude && options.data && options.data.n){
            options.data.n += this.exclude.length;
        }
        Backbone.Collection.prototype.fetch.call(this, options);
    },

    fetch_newer: function( options ){
        var data = _.defaults(options.data || {}, this.defaults);
        if (this.models.length){
            options.data.paginate_to = this.models[0].get('id');
        }
        _.extend( options, {
            add: true,
            data: data
        });
        this.fetch( options );
    },

    fetch_older: function( options ){
        var data = _.defaults(options.data || {}, this.defaults);
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
    },


    // needed so that when fetching newer photos they go to the start
    comparator: function( photo_a, photo_b ){
        if(this.data){
            switch(this.data.sort){
                case 'weighted_score':
                    return photo_a.get( "weighted_score" ) > photo_b.get( "weighted_score" ) && -1 || 1;
                case 'score':
                    return photo_a.get( "score" ) > photo_b.get( "score" ) && -1 || 1;
                case 'date':
                case 'date_utc':
                    return photo_a.get( "date" ) > photo_b.get( "date" ) && -1 || 1;
            }
        }
    }

});
});
