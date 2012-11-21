// Base class side-scroll views
/*global _ define */
define(['backbone', 'views/base/side_scroll', 'config'],
    function(Backbone, side_scroll, config){
return side_scroll.extend({

    tagName: 'li',
    className: 'award-stream',

    initialize: function(options) {
        _.bindAll(this);
        if(!options.collection) {
            this.collection = new awards_collection();
        }

        //this.collection.bind('all', this.render_thumbs, this);
        this.load_template('components/awards');

        this.no_photos = options.no_photos;

        this.post_initialize.apply(this, arguments);
    },

    post_initialize: function(){},

    events:{
        "click .x-details": "toggle_stream",
        "click .x-view-full": "goto_feed"
    },

    render: function(){

        // if there are already awards in the collection
        if(this.collection.length){
            $(this.el).html($(this.template({
                awards: this.collection
            })));
            this.scroll_init();
            this.photoswipe_init();
        }

        return this;
    },

    scroll_init: function(){


        // if already init, refresh
        if(this.scroller){
            var scroller = this.scroller;
            scroller.options.snap = this.collection.length > 2 ? 'a.x-thumb:not(:last-child), .x-left-pull': 'a.x-thumb, .x-left-pull';
            setTimeout(function () {
                scroller.refresh();
                if(scroller.currPageX === 0){
                    scroller.scrollToPage(1, 1, 0);
                }
            }, 0);

            return this;
        }

        var scroll_el = $('.x-scroll-area', this.el),
            details = $('.x-details', this.el),
            pull_distance = -0,
            left_pull_el = $('.x-left-pull', this.el),
            right_pull_el = $('.x-right-pull', this.el),
            left_pull_msg = $('.x-msg', left_pull_el),
            right_pull_msg = $('.x-msg', right_pull_el);

        function flip_pulls(scroller){
            if(scroll_el.is('.x-loading')){ return; }

            if(scroller.x > pull_distance){
                left_pull_el.addClass('x-flipped');
                if(!scroll_el.is('.x-loading')){
                    left_pull_msg.text('release');
                }
            }else{
                left_pull_el.removeClass('x-flipped');
                left_pull_msg.text('Load Newer');
            }
            if(!scroll_el.is('.x-no-more')){
                if(scroller.x < (scroller.maxScrollX - pull_distance)){
                    right_pull_el.addClass('x-flipped');
                    if(!scroll_el.is('.loading')){
                        right_pull_msg.text('release');
                    }
                }else{
                    right_pull_el.removeClass('x-flipped');
                    right_pull_msg.text('Load More');
                }
            }
        }
        try{
            var collection = this.collection;
            this.scroller = new iScroll(scroll_el[0], {
                vScroll: false,
                hScrollbar: false,
                snap: collection.length > 2 ? 'a.x-thumb:not(:last-child), .x-left-pull': 'a.x-thumb, .x-left-pull',
                momentum: false,
                onScrollEnd: function(){

                    // Set active thumb
                    var page = this.currPageX-1;
                    if(page >= 0){
                        $('.active', this.wrapper).removeClass('active');
                        var curr = $('a.x-thumb', this.wrapper).eq(page).addClass('active');
                        var text = curr.data('tag'),
                            tag = details.find('.x-tag');
                        // webkit bug!
                        // if text is blank and we set tag.text('') then the next time we
                        // set tag.text('real value') the element will not be visible.
                        // setting tag.html('&nbsp;') means the element is never really
                        // blank and never dissapears.
                        if(text){
                            tag.text(text);
                        }else{
                            tag.html('&nbsp;');
                        }
                        details.find('.x-date').text(string_utils.short_timestamp(curr.data('date')));
                        details.data('current', curr.data('id'));
                    }

                    // Pull to refresh: if scroll elements are .x-flipped - refresh
                    var scroller;
                    if(left_pull_el.is('.x-flipped') && !scroll_el.is('.x-loading')){
                        scroll_el.addClass('x-loading');
                        left_pull_msg.text('Loading...');
                        scroller = this;
                        collection.fetch_newer({
                            data: {n: config.get('side_scroll_more')},
                            success: function(){
                                if(scroller.currPageX === 0){
                                    scroller.scrollToPage(1);
                                }
                                scroll_el.removeClass('x-loading');
                                left_pull_msg.text('Load More');
                            }
                        });
                    }else if(right_pull_el.is('.x-flipped') && !scroll_el.is('.x-loading') && !scroll_el.is('.x-no-more')){
                        scroll_el.addClass('x-loading');
                        right_pull_msg.text('Loading');
                        scroller = this;
                        var options  = {
                            data: {n: config.get('side_scroll_more')},
                            success: function(collection, response){
                                if (response.response.photos.length){
                                    if(scroller.currPageX === scroller.pagesX.length){
                                        scroller.scrollToPage(scroller.pagesX.length - 1);
                                    }
                                    right_pull_msg.text('Load More');
                                }else{
                                    if(scroller.currPageX === scroller.pagesX.length){
                                        scroller.scrollToPage(scroller.pagesX.length - 1);
                                    }

                                    scroll_el.addClass('x-no-more');
                                    right_pull_msg.text('The End');
                                }
                                scroll_el.removeClass('x-loading');
                            }
                        };
                        collection.fetch_older(options);
                    }

                    flip_pulls(this);
                },
                onScrollMove: function () {
                    flip_pulls(this);
                }
            });
            this.scroller.scrollToPage(1, 1, 0);
        }catch(err){
            console.log(err);
        }
        return this;
    },

    render_thumbs: function(){
        if(this.collection.length){

            var rendered = $(this.template({
                awards: this.collection
            }));

            this.$('.x-thumbs').empty().append(rendered.find('.x-thumbs').children());

            this.photoswipe_init();

            this.scroll_init();

        }

        return this;
    },

    photoswipe_init: function(){
        var id = this.cid;
        $( "a.x-thumb", this.el ).photoswipe_init(id);
    },

    goto_feed: function(e){
        var button = $(e.currentTarget),
            query = button.data('query'),
            current = button.data('current');

        Backbone.history.navigate('#/feed/?' + unescape( query ));
    }
});
});