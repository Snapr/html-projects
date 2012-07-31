/*global _  define require */
define(['backbone', 'views/base/page', 'views/components/activity_ticker', 'views/auth_header', 'views/nearby_photostream', 'auth', 'utils/local_storage', 'config', 'utils/alerts'],
    function(Backbone, page_view, ticker, auth_header_view, nearby_photostream_view, auth, local_storage, config, alerts){
return page_view.extend({

    post_initialize: function(options){

        this.template = _.template( $("#home-template").html() );

        auth.bind("change", this.render);

        if(options.query.new_user){
            if (!local_storage.get("welcome_shown")){
                Backbone.history.navigate( "#", true );  // go here first so that back is not new_user
                Backbone.history.navigate( "#/welcome/" );
            }
        }

        // only render the home page the first time we load
        this.render(!!'initial');
    },

    post_activate: function(options){
        $.mobile.changePage( "#home", {changeHash: false} );  // must be false or jQm will change the url from x/y/z/#/ to x/y/z/#/x/y/z

        this.nearby_photostream.refresh();

        this.upload_count(config.get('upload_count'));
    },

    render: function(initial){
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

        if(auth.has("access_token")){
            var ticker_instance = new ticker({el:this.$('.news-ticker')}).render().tick();
            this.$el.on('pagehide', function(event, ui){
                ticker_instance.stop();
            });
            this.$el.on('pageshow', function(event, ui){
                ticker_instance.tick();
            });
        }

        this.nearby_photostream = new nearby_photostream_view({
           el: this.$el.find('.menu-stream')
        });
        if(!initial){
            this.nearby_photostream.refresh();
        }

        return this;
    },

    upload_count: function( count ){
        this.$(".upload-count").toggle(!!count).text( count || "0" );
    }

});
});
