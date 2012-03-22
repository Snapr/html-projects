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

        this.model.bind("change", function(){
            // alert("change from map_controls");
        })
        // this.render();
    },

    update_filter: function( e )
    {
        var filter = $(e.currentTarget).val();
        switch(filter) {
            case 'all':
                this.model.unset( "username", {silent: true});
                this.model.unset( "group", {silent: true});
                this.model.set({
                    n: 10
                });
                break;
            case 'following':
                this.model.unset( "username", {silent: true});
                this.model.unset( "group", {silent: true});
                this.model.set({
                    group: "following",
                    n: 10
                });
                break;
            case 'just-me':
                this.model.unset( "group", {silent: true});
                this.model.set({
                    username: ".",
                    n: 10
                });
                break;
            case 'just-one':
                this.model.unset( "username", {silent: true});
                this.model.unset( "group", {silent: true});
                this.model.set({
                    n: 1
                });
                break;
            }
    },

    keyword_search: function( e )
    {
        var keywords = $(e.currentTarget).find("input").val();
        if (keywords != (this.model.get( "keywords" )))
        {
            if (keywords)
            {
                this.model.set({keywords: $(e.currentTarget).find("input").val()});
            }
            else
            {
                this.model.unset( "keywords" );
            }
        }
    },

    clear_keyword_search: function()
    {
        this.model.unset( "keywords" );
    }

});
