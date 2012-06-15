/*global _  define require */
define(['config', 'backbone', 'collections/photo', 'auth'],
function(config, Backbone, photo_collection, auth){

return Backbone.Model.extend({
    url: function( method ){
        return config.get('api_base') + '/user/dashboard/';
    },
    parse: function(data){
        // have we been given a stream object or a full response
        if(data.response && data.response.stream){
            data = data.response.stream;
        }
        data.id = data.display.id;
        this.photos = new photo_collection(data.photos);
        this.photos.data = data.query;
        return data;
    },
    'delete': function( options ){
        var ajax_options = _.extend( options || {}, {
            url: config.get('api_base') + "/user/dashboard/delete/",
            dataType: "jsonp",
            data: _.extend( auth.attributes, {
                id: this.get("id"),
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    },
    prep_data: function(method, options){
        return this.attributes.query || {};
    }

});

});
