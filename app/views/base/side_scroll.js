// Base class side-scroll views
/*global _ define */
define(['backbone', 'views/base/view', 'utils/photoswipe', 'iscroll', 'utils/string', 'collections/photo', 'config'],
    function(Backbone, view, photoswipe, iScroll, string_utils, photo_collection, config){
return view.extend({

    tagName: 'article',
    className: 'x-stream',

    initialize: function(options) {
        _.bindAll(this);
        if(!options.collection){
            if(options.data){
                this.collection = new photo_collection([], {data: options.data});
            }else{
                this.collection = new photo_collection();
            }
        }

        //this.collection.bind('all', this.render_thumbs, this);
        this.load_template('components/stream');
        this.title = options.title;
        this.initial_title = options.initial_title;

        this.use_gallery = options.use_gallery !== false;

        this.no_photos = options.no_photos;
        this.fetch_attempts = 0;

        if(options.parent_view){
            this.parent_view = options.parent_view;
            this.parent_view.on('activate', this.scroll_init);
        }
        $(window).on('orientationchange', this.scroll_init);

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
        this.$('.x-title').html(title);
    },

    render: function(){
        var feed_data = this.collection.data || {};
        if (feed_data.access_token){ delete feed_data.access_token; }
        if (feed_data.n){ delete feed_data.n; }

        // what was this? I'm going to comment it out because it looks like a bad idea - Jake
        //feed_data.back = "Upload";

        this.$el.addClass('x-closed');

        $(this.el).html($(this.template({
            title: this.initial_title === undefined && this.get_title() || this.initial_title,  // title initially blank if there's a no-photos callback
            use_gallery: this.use_gallery,
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
        if(this.$el.hasClass('x-closed')){
            this.open();
        }else{
            this.close();
        }
    },

    close: function(){
        this.$('.x-scroll-area').fadeToggle();
        this.$el.toggleClass('x-open x-closed');
    },

    open: function(){
        this.$('.x-scroll-area').fadeToggle();
        this.$el.toggleClass('x-open x-closed');
        if(!this.collection.length && !this.collection.loaded){
            this.fetch();
        }else{
            this.scroll_init();
        }
    },

    fetch: function(){
        var this_view = this;
        this.$el.addClass('x-loading');

        this.collection.fetch({
            data: _.defaults(this.collection.data, {
                n: config.get('side_scroll_initial'),
                detail: 0
            }),
            success: function(collection){
                this_view.render_thumbs();
                if(!collection.length && this_view.fetch_attempts < 5 && this_view.no_photos){
                    if(this_view.no_photos()){
                        this_view.fetch_attempts += 1;
                        return;
                    }
                }
                this_view.set_title();
                collection.loaded = true;
                this_view.$el.removeClass('x-loading');

                if(!this_view.collection.length){
                    this_view.$el.addClass('x-no-photos');
                    this_view.scroll_init();
                }
            }
        });
    },

    scroll_init: function(){

        this.$('.x-thumbs').css('min-width', window.innerWidth + "px");

        var snap = this.collection.length > 2 ? 'a.x-thumb:not(:last-child), .x-left-pull': 'a.x-thumb, .x-left-pull';

        // if already init, refresh
        if(this.scroller){
            var scroller = this.scroller;
            scroller.options.snap = snap;

            // why is this 0 timeout needed?
            setTimeout(function () {
                scroller.refresh();
                // decide if we need to scroll the 'load more' element off based
                // on the height (thumbs are square)
                if(-scroller.scrollerH < scroller.x){
                    scroller.scrollToPage(1, 1, 0);
                }
            }, 0);

            return this;
        }

        var scroll_el = this.$('.x-scroll-area'),
            details = this.$('.x-details'),
            pull_distance = -0,
            left_pull_el = this.$('.x-left-pull'),
            right_pull_el = this.$('.x-right-pull');

        function flip_pulls(scroller){
            if(scroll_el.is('.x-loading')){ return; }

            if(scroller.x > pull_distance){
                left_pull_el.addClass('x-flipped');
            }else{
                left_pull_el.removeClass('x-flipped');
            }
            if(!scroll_el.is('.x-no-more')){
                if(scroller.x < (scroller.maxScrollX - pull_distance)){
                    right_pull_el.addClass('x-flipped');
                }else{
                    right_pull_el.removeClass('x-flipped');
                }
            }
        }
        try{
            var collection = this.collection,
                view = this;
            this.scroller = new iScroll(scroll_el[0], {
                vScroll: false,
                hScrollbar: false,
                snap: snap,
                momentum: false,
                // this allows you to the whole view up and down from the scrollers, but it;s not great on many devices.
                // onBeforeScrollStart: function(e){
                //     if(!('ontouchstart' in window)){
                //         e.preventDefault();
                //     }
                // },
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
                        scroller = this;
                        collection.fetch({
                            data: {n: Math.min(collection.length, 20)},
                            success: function(){
                                scroll_el.removeClass('x-loading');
                                left_pull_el.removeClass('x-flipped');
                                view.render_thumbs();
                                if(scroller.currPageX === 0){
                                    scroller.scrollToPage(1);
                                }
                            }
                        });
                    }else if(right_pull_el.is('.x-flipped') && !scroll_el.is('.x-loading') && !scroll_el.is('.x-no-more')){
                        scroll_el.addClass('x-loading');
                        scroller = this;
                        var options  = {
                            data: {n: config.get('side_scroll_more')},
                            success: function(collection, response){
                                scroll_el.removeClass('x-loading');
                                right_pull_el.removeClass('x-flipped');
                                view.render_thumbs();
                                if(scroller.currPageX === scroller.pagesX.length){
                                    scroller.scrollToPage(scroller.pagesX.length - 1);
                                }

                                if (!response.response.photos.length){
                                    scroll_el.addClass('x-no-more');
                                }
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
                use_gallery: this.use_gallery,
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
        if(this.use_gallery){
            var id = this.cid;
            $( "a.x-thumb", this.el ).photoswipe_init(id);
        }
    },

    goto_feed: function(e){
        var button = $(e.currentTarget),
            query = button.data('query'),
            current = button.data('current');

        Backbone.history.navigate('#/feed/?' + unescape( query ));
    }
});
});
