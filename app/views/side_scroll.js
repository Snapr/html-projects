snapr.views.side_scroll = Backbone.View.extend({
    // id: 'unique name for this set of side-scrollers'
    // template: _.template( $('#template').html() ),
    // thumbs_template: _.template( $('#thumbs-template').html() ),
    initialize: function() {
        this.collection.bind('all', this.re_render_thumbs, this);
    },
    render: function(){
        $(this.el).html($(this.template({collection: this.collection, model: this.model, details: this.details})));
        this.render_thumbs();
        this.photoswipe_init();
        this.scroll_init();
        return this;
    },
    scroll_init: function(){
        var scroll_el = $('.x-scroll-area', this.el),
            details = $('.x-details', this.el),
            pull_distance = -110,
            left_pull_el = $('.x-left-pull', this.el),
            right_pull_el = $('.x-right-pull', this.el),
            left_pull_msg = $('.x-msg', left_pull_el),
            right_pull_msg = $('.x-msg', right_pull_el);

        function flip_pulls(scroller){
            if(scroller.x > pull_distance){
                left_pull_el.addClass('x-flipped');
                if(!scroll_el.is('.x-loading')){
                    left_pull_msg.text('release');
                }
            }else{
                left_pull_el.removeClass('x-flipped');
                left_pull_msg.text('refresh');
            }
            if(scroller.x < (scroller.maxScrollX - pull_distance)){
                right_pull_el.addClass('x-flipped');
                if(!scroll_el.is('.loading')){
                    right_pull_msg.text('release');
                }
            }else{
                right_pull_el.removeClass('x-flipped');
                right_pull_msg.text('load more');
            }
        }
        try{
            var collection = this.collection;
            this.scroller = new iScroll(scroll_el[0], {
                vScroll: false,
                hScrollbar: false,
                snap: 'a.x-thumb, .x-left-pull',
                momentum: false,
                onScrollEnd: function(){
                    $('.active', this.wrapper).removeClass('active');
                    var curr = $('a.x-thumb', this.wrapper).eq(this.currPageX-1).addClass('active');

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
                    details.find('.x-date').text(snapr.utils.short_timestamp(curr.data('date')));

                    // Pull to refresh: if scroll elements are .x-flipped - refresh
                    if(left_pull_el.is('.x-flipped') && !scroll_el.is('.x-loading')){
                        scroll_el.addClass('x-loading');
                        left_pull_msg.text('loading');
                        scroller = this;
                        collection.fetch_newer({success: function(){
                            if(scroller.currPageX === 0){
                                scroller.scrollToPage(1);
                            }
                            scroll_el.removeClass('x-loading');
                            left_pull_msg.text('load more');
                        }});
                    }else if(right_pull_el.is('.x-flipped') && !scroll_el.is('.x-loading')){
                        scroll_el.addClass('x-loading');
                        right_pull_msg.text('loading');
                        scroller = this;
                        options  = {
                            success: function(collection, response){
                                if (response.response.photos.length){
                                    if(scroller.currPageX === scroller.pagesX.length){
                                        scroller.scrollToPage(scroller.pagesX.length - 1);
                                    }
                                    scroll_el.removeClass('x-loading');
                                    right_pull_msg.text('load more');
                                }else{
                                    // don't scroll the loading element off
                                    // if(scroller.currPageX === scroller.pagesX.length){
                                    //     scroller.scrollToPage(scroller.pagesX.length - 1);
                                    // }

                                    scroll_el.addClass('x-no-more');
                                    right_pull_msg.text('end');
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
            this.scroller.scrollToPage(1);
        }catch(err){

        }
        return this;
    },
    render_thumbs: function(){
        if(this.collection.length){
            html = this.thumbs_template({
                photos: this.collection.models
            });
            $(this.el).find('.x-thumbs').html(html);
        }
        return this;
    },
    re_render_thumbs: function(){
        if(this.collection.length){

            this.render_thumbs();

            // if the scroller is set up, refresh it
            if(this.scroller){
                scroller = this.scroller;
                setTimeout(function () {
                    scroller.refresh();
                }, 0);
            }
            this.photoswipe_init();
        }
        return this;
    },
    photoswipe_init: function(){
        id = this.id + this.cid;
        photoswipe_init(id, $( "a.x-thumb", this.el ));
    }
});
