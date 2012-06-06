snapr.models.news_period_collection = Backbone.Collection.extend({

    model: snapr.models.news_period,

    url: function( method )
    {
        return snapr.api_base + '/user/activity/';
    },

    parse: function( d, xhr )
    {
        if (d.response && d.response.news)
        {
            return d.response.news;
        }
        else
        {
            return [];
        }
    }

});
