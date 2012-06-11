/*global _ Route define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    activate: function(){
        this.change_page();
    }

});
});
