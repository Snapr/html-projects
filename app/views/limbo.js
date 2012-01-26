snapr.views.limbo = Backbone.View.extend({
    initialize: function()
    {
        _.bindAll( this );
        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();
            spinner_stop()

            return true;
        });
        
        $.mobile.changePage( $("#limbo"), {
            changeHash: false
        });
        
        spinner_start()
    }
});