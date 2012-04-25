// Abstract base class for dialogs
// adds the "back" function

snapr.views.dialog = snapr.views.page.extend({

    // needs to be called in decendent views to use "prevPage" functionality
    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.back_view = this.options.back_view;

        var dialog = this;

        this.$el.live( "pageshow", function( e, ui )
        {
            dialog.prev_el = ui.prevPage;
        })

        this.back_view = this.options.back_view;
    },

    // needs to be re-declared in decendent views
    events: {
        "click .x-back": "back"
    },

    back: function()
    {
        if (this.back_view)
        {
            snapr.info.current_view = this.back_view;

            this.back_view.change_page({
                changeHash: false,
                transition: this.transition,
                reverse: true
            });
        }
        else if (this.prev_el)
        {
            $.mobile.changePage( this.prev_el, {
                changeHash: false,
                transition: this.transition,
                reverse: true
            });
            window.history.back();
        }
        else
        {
            window.history.back();
        }

    },

    transition: "slideup",

});