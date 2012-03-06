snapr.models.dash_stream = Backbone.Model.extend({

});
snapr.models.dash = Backbone.Collection.extend({
    model: snapr.models.dash_stream,
    url: function(method){
        return snapr.api_base + '/user/dashboard/';
    },
    parse: function( d, xhr ){
        if (d.success && d.response){
            return d.response.dashboard.streams;
        }
    },
    // override fetch to catch the display attributes for the dash
    // not just it's models (streams)
    fetch: function(options) {
        options = options ? _.clone(options) : {};
        var success = options.success;
        options.success = function(collection, d){
            collection.display = d.response.dashboard.display;
            if (success) success(collection, d);
        };
        return Backbone.Collection.prototype.fetch.call(this, options);
    }
});

//    (r'^users?/dashboard/$', dashboard2.DashboardDispatch.as_view()),
//    (r'^users?/dashboard/theme/$', dashboard2.ThemeCall.as_view()),
//    (r'^users?/dashboard/edit/$', dashboard2.EditStreamCall.as_view()),
//    (r'^users?/dashboard/delete/$', dashboard2.DeleteStreamCall.as_view()),
//    (r'^users?/dashboard/reorder/$', dashboard.reorder),
