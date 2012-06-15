/*global _  define require */
define(['backbone', 'views/base/page', 'views/components/activity_ticker', 'auth'], function(Backbone, page_view, ticker, auth){
return page_view.extend({

    post_initialize: function(options){
        if(options.query.new_user){
            Backbone.history.navigate( "#", true );  // go here first so that back is not new_user
            Backbone.history.navigate( "#/welcome/" );
        }

        this.template = _.template( $("#home-template").html() );

        auth.bind("change", this.render);

        // only render the home page the first time we load
        this.render();

        if(auth.has("access_token")){
            var ticker = this.ticker = new ticker({el:this.$('.news-ticker')}).render().tick();
            this.$el.on('pagehide', function(event, ui){
                ticker.stop();
            });
        }
    },

    post_activate: function(){
        $.mobile.changePage( "#home" );
    },

    render: function(){
        this.$el
            .find("[data-role='content']")
            .html( this.template( {
                logged_in: auth.has("access_token"),
                username: auth.get("snapr_user")
            } ))
            .trigger("create");

        this.ticker.tick();

        return this;
    },

    upload_count: function( count ){
        this.$(".upload-count").toggle(!!count).text( count || "0" );
    }

});
});
