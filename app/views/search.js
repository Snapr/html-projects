snapr.views.search = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });
    },

    transition: "slideup",

    events: {
        "change #search-keywords": "update_placeholder",
        "change #search-type": "update_placeholder",
        "submit #search-form": "search",
        "click .x-back": "back"
    },

    update_placeholder: function()
    {
        var keywords = $("#search-keywords");
        var type = $("#search-type").val();

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
        var keywords = $("#search-keywords").val();
        var type = $("#search-type").val();

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
    }
});