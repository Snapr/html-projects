/*global _  define require */
define(['views/base/page', 'utils/local_storage'], function(page_view, local_storage){
    return page_view.extend({
        welcome_view: true,
        post_initialize: function(){
            local_storage.save("welcome_shown", true);
        }
    });
});
