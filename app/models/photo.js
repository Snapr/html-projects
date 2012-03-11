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
    }
});
