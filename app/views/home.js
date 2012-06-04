snapr.views.home = snapr.views.page.extend({

    initialize: function()
    {
        if(query.new_user){
            Route.navigate( "#", true );  // go here first so that back is not new_user
            Route.navigate( "#/welcome/" );
        }

        snapr.views.page.prototype.initialize.call( this );

        this.template = _.template( $("#home-template").html() );

        snapr.auth.bind("change", this.render);

        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1)
        {
            $.mobile.changePage( "#home" );
            this.render();
        }
    },

    render: function()
    {
        this.$el
            .find("[data-role='content']")
            .html( this.template( {
                logged_in: snapr.auth.has("access_token"),
                username: snapr.auth.get("snapr_user")
            } ))
            .trigger("create");

        window.ticker = new snapr.views.news_ticker({el:this.$('.news-ticker')}).render().tick();
        $( '#home' ).die('pagehide').live( 'pagehide',function(event, ui){
            window.ticker.stop();
            return true;
        });

        return this;
    },

    upload_count: function( count )
    {
        if (count)
        {
            this.$el.find( ".upload-count" ).show().text( count );
        }
        else
        {
            this.$el.find( ".upload-count" ).hide().text( "0" );
        }
    }

});
