snapr.views.dash_add_search = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });
    },

    transition: "slideup",

    events: {
        "submit #search-form": "search",
        "click div[data-role='header'] a": "back"
    },

    update_placeholder: function()
    {
        var keywords = $("#dash-search-keywords");
        var type = $("#dash-search-type").val();

        if (keywords.val().length == 0)
        {
            switch(type){
                case 'location':
                    keywords.attr( "placeholder", "Place Name…" );
                    break;
                case 'tag':
                    keywords.attr( "placeholder", "Keywords…" );
                    break;
                case 'user':
                    keywords.attr( "placeholder", "Username…" );
                    break;
            }

        }
    },

    search: function()
    {
        var keywords = $("#dash-search-keywords").val();
        var type = $("#dash-search-type").val();

        switch(type){
            case 'location':
                Route.navigate( "#/map/?location=" + keywords );
                break;
            case 'tag':
                Route.navigate( "#/feed/?keywords=" + keywords + "&list_style=grid" );
                break;
            case 'user':
                Route.navigate( "#/user/search/?username=" + keywords );
                break;
        }
    },

});