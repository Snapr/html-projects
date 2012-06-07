/*global _ Route define require */
define(['views/base/page'], function(page_view){
snapr.views.join_success = page_view.extend({

    initialize: function(){
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();
    }

});

return snapr.views.join_success;
});
