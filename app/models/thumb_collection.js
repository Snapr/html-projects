snapr.models.thumb_collection = snapr.models.photo_collection.extend({
    model: snapr.models.thumb,
    url: function( method ){
        return snapr.api_base + '/thumbs/';
    },
    comparator: function( model ){
        return - model.get("location").latitude;
    }
});
