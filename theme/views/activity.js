define(['views/activity'], function(activity_view){
    return activity_view.extend({

      post_activate: function(){
          this.$(".x-activity-streams").empty();

          this.collection.fetch();

          this.change_page();
          $.mobile.loading('show');

          $('.browse-btn').removeClass('ui-btn-active');
          $('.map-btn').removeClass('ui-btn-active');

      },

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