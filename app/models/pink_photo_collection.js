snapr.models.pink_photo_collection = Backbone.Collection.extend({
    model:snapr.models.pink_photo,
    parse: function(d,xhr){
        if(d.images){
            return d.images;
        }else{
            return [];
        }
    }
});