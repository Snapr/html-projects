snapr.models.photo_collection = Backbone.Collection.extend({
    model:snapr.models.photo,
    url: function( method ){
        return snapr.api_base + '/search/';
    },
    parse: function( d, xhr ){
        if (d.success && d.response && d.response.photos){
            return d.response.photos;
        }else{
            return [];
        }
    },
    get_photo_by_id: function( id ){
        return this.filter( function( model ){
            return model.get("id") == id;
        })[0];
    }
});
