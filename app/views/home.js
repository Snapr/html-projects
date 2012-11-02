/*global _  define require */
define(['backbone', 'views/base/page', 'views/components/activity_ticker', 'views/auth_header', 'views/nearby_photostream', 'auth', 'utils/local_storage', 'config', 'utils/alerts'],
    function(Backbone, page_view, ticker, auth_header_view, nearby_photostream_view, auth, local_storage, config, alerts){
return page_view.extend({

    post_initialize: function(options){

        auth.bind("change", this.render);

        // only render the home page the first time we load
        this.render(!!'initial');
    },

    post_activate: function(options){
        $.mobile.changePage( "#home", {changeHash: false} );  // must be false or jQm will change the url from x/y/z/#/ to x/y/z/#/x/y/z

        this.nearby_photostream.refresh();

        this.upload_count(config.get('upload_count'));
    },

    create_page: function(context){ /* override to do nothing - handled in render so we have context */ },

    render: function(initial){
        this.setElement(
            $(this.template({
                logged_in: auth.has("access_token"),
                username: auth.get("snapr_user")
            }))
        );

        this.$el.appendTo(document.body);

        if(auth.has("access_token")){
            var ticker_instance = new ticker({el:this.$('.x-news-ticker')}).render().tick();
            this.$el.on('pagehide', function(event, ui){
                ticker_instance.stop();
            });
            this.$el.on('pageshow', function(event, ui){
                ticker_instance.tick();
            });
        }

        this.nearby_photostream = new nearby_photostream_view({
           el: this.$('.x-menu-stream')
        });
        if(initial !== true){
            this.nearby_photostream.refresh();
        }

        return this;
    },

    upload_count: function( count ){
        this.$(".x-upload-count").toggle(!!count).text( count || "0" );
    }

});
});
