define(['views/dialog'], function(dialog_view){
snapr.views.welcome = dialog_view.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });
    },

    events: {
        "click .x-back": "back"
    }
});

return snapr.views.welcome;
});
