snapr.views.about = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });
    },

    transition: "slideup",

    events: {
        "click .x-back": "back"
    }
});
