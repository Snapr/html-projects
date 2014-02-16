define(['views/search'], function(search_view){
    return search_view.extend({

        events: function(){
              return _.extend({},search_view.prototype.events,{

              });
           },

    });

});