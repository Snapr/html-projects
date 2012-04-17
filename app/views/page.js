// Abstract base class for pages
// sets the page element and binds pagehide

snapr.views.page = Backbone.View.extend({

    initialize: function()
    {
        this.setElement( this.options.el );

        this.$el.on( "pagebeforehide", function( e, to )
        {
            if (to &&
                to.nextPage &&
                to.nextPage[0] &&
                to.nextPage[0].dataset &&
                to.nextPage[0].dataset.role == "dialog")
            {
                // console.log( "going to dialog" );
            }
            else
            {
                // console.log( "not going to dialog - undelegate" );
                $(e.target).undelegate();
            }

            return true;
        });

        _.bindAll( this );
    },

    change_page: function( options )
    {
        var options = _.extend({
            changeHash: false
        }, options || {});
        $.mobile.changePage( this.$el, options);
    },

});