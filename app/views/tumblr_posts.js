/*global _  define require */
define(['views/base/page', 'collections/tumblr_post', 'iscroll'], function(page_view, tumblr_collection, iScroll){

var tumblr_post_view = page_view.extend({

    post_initialize: function(){
        this.collection = new tumblr_collection();
    },

    post_activate: function(options){
        var this_view = this;

        this.change_page();
        $.mobile.showPageLoadingMsg();
        this.$el.addClass('x-loading');

        this.$('.x-posts').empty();

        this.$('.x-dropdown').hide();

        this.collection.bind( "change", _.bind(this.render, this) );

        this.collection.fetch({
            host: options.query.host,
            data: {
                filter:'text'
            },
            success: function() {
                this_view.render();
            },
            error: function() {
                this_view.render();
            }
        });
    },

    events: {
        "click .x-has-dropdown": "toggle_dropdown",
        "click .x-has-dropdown a": "toggle_dropdown"
    },

    get_default_tab: function(){ return 'dash'; },

    render: function(){

        var parentWidth = this.$el.width();

        this.replace_from_template({
            host: this.options.query.host,
            title: this.collection.blog_title,
            posts: this.collection.models,
            getPhotoURL: function(model, size) {
                size = size || parentWidth;
                // Returns the best image URL from available photo sizes based on the specified
                // "size" parameter. For non-native sizes, returns the next largest size (if available).
                var images = model.alt_sizes,
                    src = "";
                for (var i = 0; i < images.length; i++) {
                    if(images[i].width >= size){
                        src = images[i].url;
                    }else{
                        break;
                    }
                }
                return (src === "") ? images[0].url : src;
            },
            getVideoEmbed: function(model, size) {
                size = size || parentWidth;
                // Returns the best embed code from available video sizes based on the specified
                // "size" parameter. For non-native sizes, returns the next smallest size.
                var players = model.get('player'),
                    embed = "";
                for (var i = 0; i < players.length; i++) {
                    if (players[i].width <= size){ embed = players[i].embed_code; }else{ break; }
                }
                return (embed === "") ? players[0].embed_code : embed;
            }
        }, ['.x-posts', '.x-tumblr-footer', '.x-blog-title']);

        this.scroll_init();

        this.$el.trigger('create');

        $.mobile.hidePageLoadingMsg();
        this.$el.removeClass('x-loading');

    },

    scroll_init: function(){
        this.$('.x-multiple-photos .x-photo').each(function(){
            var $this= $(this);
            $this.closest('li').width($this.closest('li').height()*$this.data('aspect'));
        });
        this.$('.x-multiple-photos').each(function(){
            new iScroll($(this).parent()[0], {
                vScroll: false,
                hScrollbar: false,
                momentum: false,
                snap: 'li'
            });
        });
    },

    toggle_dropdown: function(e){
        this.$('.x-dropdown').toggle();

        e.preventDefault();
    }
});

return tumblr_post_view;

});
