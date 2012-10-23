/*global _  define require */
define(['backbone', 'views/base/page', 'utils/dialog'], function(Backbone, page_view, dialog){
return page_view.extend({

    post_activate: function(){

        var page = this;
        this.$el.on( "pagebeforeshow", function( e, obj ){
            if (obj && obj.prevPage && obj.prevPage.length){
                if ($(obj.prevPage[0]).attr("id") == "map"){
                    $(e.currentTarget).find(".x-search-type").val("location").selectmenu("refresh");
                }
            }else{
                    $(e.currentTarget).find(".x-search-type").val("tags").selectmenu("refresh");
            }
        });

        this.change_page();
    },

    events: {
        "change .x-search-field": "update_placeholder",
        "change .x-search-type": "update_placeholder",
        "submit form": "search"
    },

    update_placeholder: function(){
        var keywords = $(".x-search-field");
        var type = $(".x-search-type").val();

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
        var keywords = $(".x-search-field").val();
        var type = $(".x-search-type").val();

        switch(type){
            case 'location':
                if (window.location.hash.indexOf('#/map/') === 0){
                    this.back();
                    this.previous_view && this.previous_view.location_search(keywords);
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
                dialog('user/search/?username='+keywords);
                break;
        }
    }
});

});
