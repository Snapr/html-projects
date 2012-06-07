/*global _ Route define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    post_initialize: function(){
        this.change_page();
    }

});
});
