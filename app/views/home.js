snapr.views.home = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        this.template = _.template( $("#home-template").html() );

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        snapr.auth.bind("change", this.render);

        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1)
        {
            console.log( 'changing page' );
            $.mobile.changePage( "#home" );
            this.render();
        }
    },

    render: function()
    {
        $(this.el)
            .find("[data-role='content']")
            .html( this.template( {
                logged_in: snapr.auth.has("access_token"),
                username: snapr.auth.get("snapr_user")
            } ))
            .trigger("create");

        return this;
    },

    upload_count: function( count )
    {
        if (count)
        {
            Route.navigate( '#/uploading/', true );
        }
    },

    upload_progress: function( upload_data )
    {
        Route.navigate( '#/uploading/', true );
    },

    upload_completed: function( queue_id, snapr_id )
    {
        Route.navigate( "#/love-it/?shared=true&photo_id=" + snapr_id, true );
    }


});
