// Abstract base class for pages
// sets the page element and binds pagehide

snapr.views.page = Backbone.View.extend({

    initialize: function()
    {
        this.setElement( this.options.el );

        this.$el.on( "pagehide", function( e )
        {
            $(e.target).undelegate();

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
    }
});