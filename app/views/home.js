define(['views/base/page', 'views/activity_ticker'], function(page_view, ticker){
snapr.views.home = page_view.extend({

    snapr_initialize: function(options){
        if(options.query.new_user){
            Route.navigate( "#", true );  // go here first so that back is not new_user
            Route.navigate( "#/welcome/" );
        }

        this.template = _.template( $("#home-template").html() );

        snapr.auth.bind("change", this.render);

        console.debug(_.extend($.mobile, {}), $.mobile.activePage);
        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1){
            $.mobile.changePage( "#home" );
            this.render();
        }
        this.render();
    },

    render: function(){
        this.$el
            .find("[data-role='content']")
            .html( this.template( {
                logged_in: snapr.auth.has("access_token"),
                username: snapr.auth.get("snapr_user")
            } ))
            .trigger("create");

        window.ticker = new ticker({el:this.$('.news-ticker')}).render().tick();
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

return snapr.views.home;
});
