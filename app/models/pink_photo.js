snapr.models.pink_photo = Backbone.Model.extend({
    urlRoot: snapr.api_base + '/photo/',
    url: function(method){
        return this.urlRoot;
    },
    parse: function(d,xhr){
        if(d.images){
            return d.images[0];
        }else{
            return {};
        }
    }
});