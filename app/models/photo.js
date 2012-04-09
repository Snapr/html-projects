snapr.models.photo = Backbone.Model.extend({
    urlRoot: function()
    {
        return snapr.api_base + '/photo/'
    },
    url: function( method )
    {
        return this.urlRoot();
    },
    parse: function( d, xhr )
    {
        if (d.response && d.response.photos)
        {
            return d.response.photos[0];
        }
        else
        {
            return {};
        }
    },
    change_status: function( status, options )
    {
        var ajax_options = _.extend( options || {}, {
            url: this.urlRoot() + "change_status/",
            dataType: "jsonp",
            data: _.extend( snapr.auth.attributes, {
                id: this.get("id"),
                status: status,
                _method: "POST"
            })
        });
        $.ajax( ajax_options );
    }
});
