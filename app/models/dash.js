snapr.models.dash_stream = Backbone.Model.extend({
    initialize: function(){
        this.photos = new snapr.models.photo_collection(this.get('photos'));
        this.photos.data = this.get('query');
    },
    parse: function(data){
        data.id = data.display.id;
        return data;
    },
    'delete': function( options ){
        console.log(options);
        var ajax_options = _.extend( options || {}, {
            url: snapr.api_base + "/user/dashboard/delete/",
            dataType: "jsonp",
            data: _.extend( snapr.auth.attributes, {
                id: this.get("id"),
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    }

});

snapr.models.dash = Backbone.Collection.extend({

    model: snapr.models.dash_stream,

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

//    (r'^users?/dashboard/$',
//    (r'^users?/dashboard/theme/$',
//    (r'^users?/dashboard/edit/$',
//    (r'^users?/dashboard/delete/$',
//    (r'^users?/dashboard/reorder/$',
