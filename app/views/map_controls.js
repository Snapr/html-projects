snapr.views.map_controls = Backbone.View.extend({

    events: {
        "change #map-filter": "update_filter",
        "submit #map-keyword": "keyword_search",
        "blur #map-keyword": "keyword_search",
        "click #map-keyword .ui-input-clear": "clear_keyword_search",
    },

    initialize: function () {
        _.bindAll( this );
        this.map_view = this.options.map_view;
        // this.render();
    },

    update_filter: function( e )
    {
        var filter = $(e.currentTarget).val(),
            query;
        switch(filter) {
            case 'all':
                query = {
                    n: 10
                };
                break;
            case 'following':
                query = {
                    group: 'following',
                    n: 10
                };
                break;
            case 'just-me':
                query = {
                    username: '.',
                    n: 10
                };
                break;
            case 'just-one':
                query = {
                    n: 1
                };
                break;
            }

        this.map_view.get_thumbs( query );
    },

    keyword_search: function( e )
    {
        if ($(e.currentTarget).find("input").val() != (this.map_view.query.keywords || ""))
        {
            if ($(e.currentTarget).find("input").val())
            {
                this.map_view.query.keywords = $(e.currentTarget).find("input").val();
                this.map_view.get_thumbs();
            }
            else
            {
                delete this.map_view.query.keywords;
                this.map_view.get_thumbs();
            }
        }
    },

    clear_keyword_search: function()
    {
        delete this.map_view.query.keywords;
        this.map_view.get_thumbs();
    }

});
