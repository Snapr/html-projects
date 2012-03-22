snapr.models.thumb_collection = Backbone.Collection.extend({
    model: snapr.models.thumb,
    url: function( method )
    {
        return snapr.api_base + '/thumbs/';
    },
    parse: function( d, xhr )
    {
        if (d.success && d.response && d.response.photos)
        {
            return d.response.photos;
        }
    },
    comparator: function( model )
    {
        return - model.get("location").latitude;
    }
});
