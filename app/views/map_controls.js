snapr.views.map_controls = Backbone.View.extend({

    events: {
        "change #map-filter": "update_filter",
        "submit #map-keyword": "keyword_search",
        "blur #map-keyword": "keyword_search",
        "click #map-keyword .ui-input-clear": "clear_keyword_search",
        "click .map-time": "reset_map_time"
    },

    initialize: function()
    {
        _.bindAll( this );
        this.map_view = this.options.map_view;
        this.model.bind( "change", this.render );
        this.collection.bind( "reset", this.render );
    },

    update_filter: function( e )
    {
        var filter = $(e.currentTarget).val();
        switch(filter) {
            case 'all':
                this.model.unset( "username", {silent: true});
                this.model.unset( "group", {silent: true});
                this.model.unset( "photo_id", {silent: true});
                this.model.set({
                    n: 10
                });
                break;
            case 'following':
                this.model.unset( "username", {silent: true});
                this.model.unset( "group", {silent: true});
                this.model.unset( "photo_id", {silent: true});
                this.model.set({
                    group: "following",
                    n: 10
                });
                break;
            case 'just-me':
                this.model.unset( "group", {silent: true});
                this.model.unset( "photo_id", {silent: true});
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
    },

    render: function()
    {
        $(this.el).find("#map-filter option[value='just-me']").attr("disabled", !snapr.auth.has("snapr_user"));
        $(this.el).find("#map-filter option[value='following']").attr("disabled", !snapr.auth.has("snapr_user"));
        $(this.el).find("#map-filter option[value='just-one']").attr("disabled", !this.model.has("photo_id"));

        if (this.model.has( "photo_id" ) && this.model.get( "n" ) == 1)
        {
            $("#map-filter").val("just-one").selectmenu('refresh', true);
            var thumb = this.collection.get_photo_by_id( this.model.get( "photo_id" ) );
            if (thumb)
            {
                console.warn("thumb", thumb.get( "date" ));
            }
        }
        else if (!this.model.has( "username" ) && this.model.get( "group" ) == "following")
        {
            $("#map-filter").val("following").selectmenu('refresh', true);
        }
        else if (this.model.get( "username" ) == "." && !this.model.has( "group" ))
        {
            $("#map-filter").val("just-me").selectmenu('refresh', true);
        }
        else
        {
            $("#map-filter").val("all").selectmenu('refresh', true);
        }

        if (this.model.has( "photo_id" ) &&
            this.model.get( "n" ) == 1 &&
            this.collection.get_photo_by_id( this.model.get( "photo_id" ) ) )
        {
            var thumb = this.collection.get_photo_by_id( this.model.get( "photo_id" ) );
            if (thumb)
            {
                this.show_map_time( thumb.get( "date" ) );
                this.model.set({date: thumb.get( "date" )}, {silent: true});
            }
        }
        else
        {
            this.show_map_time();
            this.model.unset("date", {silent: true});
        }


        $(this.el).find("#map-keyword input").val( this.model.get("keywords") || "" );

        return this;
    },

    show_map_time: function( time )
    {
        if (time)
        {
            $(this.el).find(".map-time").find(".ui-bar").text( snapr.utils.short_timestamp( time, true) );
        }
        else
        {
            $(this.el).find(".map-time").find(".ui-bar").text( "Now" );
        }
    },

    reset_map_time: function()
    {
        this.model.unset( "photo_id", {silent: true} );
        this.model.unset( "date" );
    }

});
