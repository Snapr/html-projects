/*global _  define require */
define(['views/feed'], function(base_feed){
return base_feed.extend({

    show_user: function(e){
        window.location.hash = "#/user/profile/?username=" + $(e.currentTarget).data('username');
    }

});
});
