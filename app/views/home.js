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
    
    events: {
        "click .camera": "camera",
        "click .camera-roll": "camera_roll"
    },
    
    camera: function()
    {
        console.warn("camera");
        if (snapr.utils.get_local_param("appmode"))
        {
            pass_data("snapr://camera");
        }
        else
        {
            Route.navigate( '#/upload/', true );
        }
    },

    camera_roll: function()
    {
        console.warn("camera-roll");
        if (snapr.utils.get_local_param("appmode"))
        {
            pass_data("snapr://camera-roll");
        }
        else
        {
            Route.navigate( '#/upload/', true );
        }

    }


});