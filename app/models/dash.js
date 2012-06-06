define(['backbone', 'collections/photo'],
function(Backbone,   photo_collection){

var stream = Backbone.Model.extend({
    url: function( method ){
        return snapr.api_base + '/user/dashboard/';
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
            url: snapr.api_base + "/user/dashboard/delete/",
            dataType: "jsonp",
            data: _.extend( snapr.auth.attributes, {
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

return Backbone.Collection.extend({

    model: stream,

    url: function( method )
    {
        return snapr.api_base + '/user/dashboard/';
    },

    parse: function( d, xhr )
    {
        if (d.success && d.response)
        {
            return d.response.dashboard.streams;
        }
    },

    // override fetch to catch the display attributes for the dash
    // in the returned data not just it's models (streams)
    fetch: function( options )
    {
        options = options ? _.clone(options) : {};
        var success = options.success;
        options.success = function( collection, d )
        {
            collection.display = d && d.response && d.response.dashboard && d.response.dashboard.display;
            if (success) success( collection, d );
        };
        return Backbone.Collection.prototype.fetch.call(this, options);
    }
});
});
