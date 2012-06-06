define(['views/dialog'], function(dialog_view){
snapr.views.app = dialog_view.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });
    }
});

return snapr.views.app;
});
