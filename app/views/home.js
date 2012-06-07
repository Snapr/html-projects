/*global _ Route define require snapr */
define(['views/base/page', 'views/components/activity_ticker', 'auth'], function(page_view, ticker, auth){
return page_view.extend({

    post_initialize: function(options){
        if(options.query.new_user){
            Route.navigate( "#", true );  // go here first so that back is not new_user
            Route.navigate( "#/welcome/" );
        }

        this.template = _.template( $("#home-template").html() );

        auth.bind("change", this.render);

        // only render the home page the first time we load
        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1){
            $.mobile.changePage( "#home" );
            this.render();
        }
    },

    render: function(){
        this.$el
            .find("[data-role='content']")
            .html( this.template( {
                logged_in: auth.has("access_token"),
                username: auth.get("snapr_user")
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
});
