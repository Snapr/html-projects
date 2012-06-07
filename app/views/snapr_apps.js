/*global _ Route define require */
define(['views/base/dialog'], function(dialog_view){
return dialog_view.extend({

    post_initialize: function(){
        this.change_page({
            transition: this.transition
        });
    },

    events: {
        "click .x-back": "back"
    }
});
});
