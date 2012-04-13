snapr.views.limbo = snapr.views.page.extend({

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();

        setTimeout(function()
        {
            spinner_start();
        },100);
    }
});