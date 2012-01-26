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
            console.warn( 'changing page' );
            $.mobile.changePage( "#home" );
            this.render();
        }
    },

    render: function()
    {
        $(this.el).find("[data-role='content'] ul")
            .html( this.template( {logged_in: snapr.auth.has("access_token")} ))
            .listview().listview("refresh");
        $pinkHearts = $(this.el).find(".home-pink-hearts");
        
        setTimeout(function(){
            $pinkHearts.css("height", window.innerHeight - $pinkHearts.position().top - 2 + "px");
        }, 50);

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