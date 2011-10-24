tripmapper.models.photo_collection = Backbone.Collection.extend({
    model:tripmapper.models.photo,
    parse: function(d,xhr){
        if(d.response && d.response.photos){
            return d.response.photos;
        }else{
            return [];
        }
    }
});