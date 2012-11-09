/*global _  define require */
define(['backbone', 'views/base/page', 'views/components/activity_ticker', 'views/nearby_photostream', 'auth', 'utils/local_storage', 'config', 'utils/alerts'],
    function(Backbone, page_view, ticker, nearby_photostream_view, auth, local_storage, config, alerts){
return page_view.extend({

    post_initialize: function(options){
        auth.on('login logout', this.render);
    },

    post_activate: function(options){
        $.mobile.changePage( "#home", {changeHash: false} );  // must be false or jQm will change the url from x/y/z/#/ to x/y/z/#/x/y/z

        this.render_nearby_photostream();
        this.render_ticker();

        this.upload_count(config.get('upload_count'));
    },

    render: function(){

        this.replace_from_template({}, ['[data-role="header"]', '[data-role="content"]']);
        this.render_ticker();

        return this;
    },

    render_ticker: function(){
        if(auth.has("access_token")){
            var ticker_instance = new ticker({el:this.$('.x-news-ticker')}).render().tick();
            this.$el.on('pagehide', function(event, ui){
                ticker_instance.stop();
            });
            this.$el.on('pageshow', function(event, ui){
                ticker_instance.tick();
            });
        }
        this.$el.trigger('create');

        return this;
    },

    render_nearby_photostream: function(){

        this.nearby_photostream = new nearby_photostream_view({
           el: this.$('.x-menu-stream')
        });
        this.nearby_photostream.refresh();

        this.$el.trigger('create');

        return this;
    },

    upload_count: function( count ){
        this.$(".x-upload-count").toggle(!!count).text( count || "0" );
    }

});
});
