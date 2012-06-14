/*global _  define require */
define(['backbone', 'views/base/page'], function(Backbone, page_view){
return page_view.extend({

    post_activate: function(){

        var page = this;
        this.$el.on( "pagebeforeshow", function( e, obj ){
            if (obj && obj.prevPage && obj.prevPage.length){
                if ($(obj.prevPage[0]).attr("id") == "map"){
                    $(e.currentTarget).find("#search-type").val("location").selectmenu("refresh");
                }
            }else{
                    $(e.currentTarget).find("#search-type").val("tags").selectmenu("refresh");
            }
        });

        this.change_page();
    },

    events: {
        "change #search-keywords": "update_placeholder",
        "change #search-type": "update_placeholder",
        "submit #search-form": "search"
    },

    update_placeholder: function(){
        var keywords = $("#search-keywords");
        var type = $("#search-type").val();

        if (keywords.val().length === 0){
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

    search: function(){
        var keywords = $("#search-keywords").val();
        var type = $("#search-type").val();

        switch(type){
            case 'location':
                if (window.location.hash == "#/map/?location=" + keywords ){
                    this.back();
                    this.back_view && this.back_view.search_location( keywords );
                }else{
                    Backbone.history.navigate( "#/map/?location=" + keywords );
                }
                break;
            case 'tag':
                if (window.location.hash == "#/feed/?keywords=" + keywords + "&list_style=grid" ){
                    this.back();
                }else{
                    Backbone.history.navigate( "#/feed/?keywords=" + keywords + "&list_style=grid" );
                }
                break;
            case 'user':
                if (window.location.hash == "#/user/search/?username=" + keywords ){
                    this.back();
                }else{
                    Backbone.history.navigate( "#/user/search/?username=" + keywords );
                }
                break;
        }
    }
});

});
