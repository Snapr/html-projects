// Base class side-scroll views
/*global _ define */
define(['backbone', 'views/base/view', 'utils/photoswipe', 'iscroll', 'utils/string', 'collections/photo', 'config'],
    function(Backbone, view, photoswipe, iScroll, string_utils, photo_collection, config){
return view.extend({

    tagName: 'li',
    className: 'image-stream',

    initialize: function(options) {
        _.bindAll(this);
        if(!options.collection){
            if(options.data){
                this.collection = new photo_collection([], {data: options.data});
            }else{
                this.collection = new photo_collection();
            }
        }

        this.collection.bind('all', this.render_thumbs, this);
        this.load_template('components/stream');
        this.title = options.title;
        this.initial_title = options.initial_title;

        this.no_photos = options.no_photos;
        this.fetch_attempts = 0;

        this.post_initialize.apply(this, arguments);
    },

    post_initialize: function(){},

    events:{
        "click .x-details": "toggle_stream",
        "click .x-view-full": "goto_feed"
    },

    get_title: function(){
        return this.title;
    },

    set_title: function(title){
        title = title || this.get_title();
        this.$('.title').html(title);
    },

    render: function(){
        var feed_data = this.collection.data || {};
        if (feed_data.access_token){ delete feed_data.access_token; }
        if (feed_data.n){ delete feed_data.n; }

        // what was this? I'm going to comment it out because it looks like a bad idea - Jake
        //feed_data.back = "Upload";

        this.$el.addClass('closed');

        $(this.el).html($(this.template({
            title: this.initial_title === undefined && this.get_title() || this.initial_title,  // title initially blank if there's a no-photos callback
            query: this.collection.data,
            photos: this.collection.models
        })));

        if(this.options.expand){
            this.toggle_stream();

            // if there are already photos in the collection
            if(this.collection.length){
                this.scroll_init();
                this.photoswipe_init();
            }
        }
        return this;
    },

    toggle_stream: function() {
        if(this.$el.hasClass('closed')){
            this.open();
        }else{
            this.close();
        }
    },

    close: function(){
        this.$('.thumbs-grid').fadeToggle();
        this.$el.toggleClass('open closed');
    },

    open: function(){
        this.$('.thumbs-grid').fadeToggle();
        this.$el.toggleClass('open closed');
        if(!this.collection.length && !this.collection.loaded){
            this.fetch();
        }else{
            this.scroll_init();
        }
    },

    fetch: function(){
        var this_view = this;
        this.$el.addClass('loading');

        this.collection.fetch({
            data: _.defaults(this.collection.data, {
                n: config.get('side_scroll_initial'),
                detail: 0
            }),
            success: function(collection){
                if(!collection.length && this_view.fetch_attempts < 5 && this_view.no_photos){
                    if(this_view.no_photos()){
                        this_view.fetch_attempts += 1;
                        return;
                    }
                }
                this_view.set_title();
                collection.loaded = true;
                this_view.$el.removeClass('loading');

                if(!this_view.collection.length){
                    this_view.$el.addClass('no-photos');
                    this_view.scroll_init();
                }
            }
        });
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
                title: '',
                photos: this.collection.models,
                query: this.collection.data
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
