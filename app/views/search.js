snapr.views.search = Backbone.View.extend({

    el: $('#search'),

    events: {
        "change #search-keywords": "update_placeholder",
        "change #search-type": "update_placeholder",
        "submit #search-form": "search"
    },

    initialize: function()
    {
        $.mobile.changePage($("#search"), {
            changeHash: false,
            transition: "slidedown"
        });
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
                Route.navigate( "/map/?location=" + keywords, true );
                break;
            case 'tag':
                Route.navigate( "/feed/?keywords=" + keywords + "&list_style=grid", true );
                break;
            case 'user':
                Route.navigate( "/user/search/?username=" + keywords, true );
                break;
        }
        

        console.log( "search for ", keywords, " in ", type );
    }

});