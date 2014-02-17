define(['views/activity'], function(activity_view){
    return activity_view.extend({

        events: function(){
              return _.extend({},activity_view.prototype.events,{
                    'click .x-menu-button': 'open_menu',
                    'click .s-username' : 'prevent'
              });
           },

          open_menu: function(){
              $('.x-side-menu').panel('open');
          },

          prevent: function(e) {
                e.preventDefault();
          }

    });
});