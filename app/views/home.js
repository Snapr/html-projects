/*global _  define require */
define(['backbone', 'views/base/page', 'views/components/activity_ticker', 'views/auth_header', 'views/nearby_photostream', 'auth', 'utils/local_storage', 'config'],
    function(Backbone, page_view, ticker, auth_header_view, nearby_photostream_view, auth, local_storage, config){
return page_view.extend({

    post_initialize: function(options){
        if(options.query.new_user){
            if (!local_storage.get("welcome_shown"))
            {
                Backbone.history.navigate( "#", true );  // go here first so that back is not new_user
                Backbone.history.navigate( "#/welcome/" );
            }
        }

        this.template = _.template( $("#home-template").html() );

        auth.bind("change", this.render);

        // only render the home page the first time we load
        this.render();
    },

    post_activate: function(){
        $.mobile.changePage( "#home" );
        this.upload_count(config.get('upload_count'));
    },

    render: function(){
        this.$el
            .find("[data-role='content']")
            .html( this.template( {
                logged_in: auth.has("access_token"),
                username: auth.get("snapr_user")
            } ))
            .trigger("create");

        var auth_header = new auth_header_view({
            el: this.$('.auth-header')
        });

        var nearby_photostream = new nearby_photostream_view({
           el: this.$('.menu-stream') 
        });
        nearby_photostream.render();

        if(auth.has("access_token")){
            var ticker_instance = new ticker({el:this.$('.news-ticker')}).render().tick();
            this.$el.on('pagehide', function(event, ui){
                ticker_instance.stop();
            });
            this.$el.on('pageshow', function(event, ui){
                ticker_instance.tick();
            });
        }


        return this;
    },

    upload_count: function( count ){
        this.$(".upload-count").toggle(!!count).text( count || "0" );
    }

});
});
