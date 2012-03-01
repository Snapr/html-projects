snapr.models.thumb_collection = Backbone.Collection.extend({
    model:snapr.models.thumb,
    //urlRoot: snapr.api_base + '/thumbs/',
    url: function( method ){
        return snapr.api_base + '/thumbs/';
    },
    parse: function( d, xhr ){
        if (d.success && d.response && d.response.photos){
            return d.response.photos;
        }
    }
});
