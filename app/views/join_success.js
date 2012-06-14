/*global _  define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    post_activate: function(){
        this.change_page();
    }

});
});
