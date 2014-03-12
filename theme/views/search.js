define(['views/search'], function(search_view){
    return search_view.extend({

        post_activate: function(){

            var page = this;
            this.$el.on( "pagebeforeshow", function( e, obj ){
                if (obj && obj.prevPage && obj.prevPage.length){
                    if ($(obj.prevPage[0]).attr("id") == "map"){
                        $(e.currentTarget).find("select.x-search-type").val("location").selectmenu("refresh");
                    }
                }else{
                        $(e.currentTarget).find("select.x-search-type").val("tags").selectmenu("refresh");
                }
            });

            this.change_page();

            $('#browse-btn').removeClass('ui-btn-active');
            $('#map-btn').removeClass('ui-btn-active');
            $('#post-btn').removeClass('ui-btn-active');

            $('.x-side-menu .ui-btn-active').removeClass('ui-btn-active');
            $('.x-side-menu [data-slug="search"]').addClass('ui-btn-active');
        },

        events: function(){
              return _.extend({},search_view.prototype.events,{
                    'click .x-menu-button': 'open_menu'
              });
           },

         search: function(e){
             if(e && e.preventDefault){
                 e.preventDefault();
             }

             var keywords = this.$(".x-search-field").val();
             var type = this.$("select.x-search-type").val();

             switch(type){
                 case 'location':
                     if (window.location.hash.indexOf('#/map/') === 0){
                         this.back();
                         this.previous_view && this.previous_view.location_search(keywords);
                     }else{
                         window.location.hash = "#/map/?location=" + keywords;
                     }
                     break;
                 case 'tag':
                     if (window.location.hash == "#/all/?keywords=" + keywords){
                         this.back();
                     }else{
                         window.location.hash = "#/all/?keywords=" + keywords;
                     }
                     break;
                 case 'user':
                     dialog('user/search/?username='+keywords);
                     break;
             }
         },

      open_menu: function(){
          $('.x-side-menu').panel('open');
      }

    });

});