tripmapper.models.thumb_collection = Backbone.Collection.extend({
    model:tripmapper.models.thumb,
    urlRoot: tripmapper.api_base + '/thumbs/',
    url: function(method){
        return this.urlRoot;
    },
    parse: function(d,xhr){
        if(d.success && d.response && d.response.photos){
            return d.response.photos;
        }
    }
});