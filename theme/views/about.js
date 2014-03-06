define(['views/base/page'], function(about_view){
    return about_view.extend({

        events: function(){
              return _.extend({},about_view.prototype.events,{
                    'click .x-menu-button': 'open_menu'
              });
           },

          open_menu: function(){
              $('.x-side-menu').panel('open');
          }

    });
});