snapr.models.photo = Backbone.Model.extend({
    //urlRoot: snapr.api_base + '/photo/',
    url: function( method ){
        return snapr.api_base + '/photo/';
    },
    parse: function( d, xhr ){
        if(d.response && d.response.photos){
            return d.response.photos[0];
        }else{
            return {};
        }
    }
});
