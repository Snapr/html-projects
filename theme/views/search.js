define(['views/search'], function(search_view){
    return search_view.extend({

        events: function(){
              return _.extend({},search_view.prototype.events,{

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
                       if (window.location.hash == "#/photos/?keywords=" + keywords){
                           this.back();
                       }else{
                           window.location.hash = "#/photos/?keywords=" + keywords;
                       }
                       break;
                   case 'user':
                       dialog('user/search/?username='+keywords);
                       break;
               }
           }

    });

});