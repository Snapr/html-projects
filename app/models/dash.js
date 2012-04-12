snapr.models.dash_stream = Backbone.Model.extend({
    initialize: function() {
        console.log('dash stream init');
        this.photos = new snapr.models.photo_collection(this.get('photos'));
    }
});
snapr.models.dash = Backbone.Collection.extend({
    model: snapr.models.dash_stream,
    url: function( method ){
        return snapr.api_base + '/user/dashboard/';
    },
    parse: function( d, xhr ){
        console.log('dash parse');
        if (d.success && d.response){
            return d.response.dashboard.streams;
        }
    },
    // override fetch to catch the display attributes for the dash
    // in the returned data not just it's models (streams)
    fetch: function(options){
        console.log('dash fetch');
        options = options ? _.clone(options) : {};
        var success = options.success;
        options.success = function(collection, d){
            collection.display = d.response.dashboard.display;
            if (success) success(collection, d);
        };
        return Backbone.Collection.prototype.fetch.call(this, options);
    }
});

//    (r'^users?/dashboard/$',
//    (r'^users?/dashboard/theme/$',
//    (r'^users?/dashboard/edit/$',
//    (r'^users?/dashboard/delete/$',
//    (r'^users?/dashboard/reorder/$',
