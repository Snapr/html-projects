snapr.views.home = Backbone.View.extend({

    initialize: function()
    {
        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });

        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1)
        {
            console.warn( 'changing page' );
            $.mobile.changePage( "#home" );
        }
    },

    upload_progress: function( upload_data )
    {
        Route.navigate( '#/uploading/', true );
    },
    
    upload_completed: function( queue_id, snapr_id )
    {
        this.pending_uploads[queue_id] && delete this.pending_uploads[queue_id];
        
        Route.navigate( "#/love-it/?shared=true&photo_id=" + snapr_id, true );
    }
    

});