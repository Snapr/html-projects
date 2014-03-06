define(['views/base/page'], function(about_view){
    return about_view.extend({

      post_activate: function(){
          this.change_page();
          $('.browse-btn').removeClass('ui-btn-active');
          $('.map-btn').removeClass('ui-btn-active');

          $('.x-side-menu .ui-btn-active').removeClass('ui-btn-active');
          $('.x-side-menu [data-slug="about"]').addClass('ui-btn-active');
      },

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