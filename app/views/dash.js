snapr.views.dash_stream = snapr.views.side_scroll.extend({
    id: 'dash',
    template: _.template( $('#dash-stream-template').html() ),
    render: function(){
        this.photos = new snapr.views.dash_stream_thumbs({
            collection: this.model.photos
        });
        this.photos.stream = this;
        this.photos.render();
        this.$el.html(
            this.template( {
                stream: this.model
            } )
        );
        this.photos.$el.insertAfter( this.$el.find('.left-pull') );
        return this;
    },
    photoswipe_init: function(){
        //photoswipe_init('stream'+this.model.cid, $( "a.image-link", this.$el ));
    }

});

snapr.views.dash_stream_thumbs = Backbone.View.extend({

    template: _.template( $('#dash-thumbs-template').html() ),
    initialize: function() {
        this.collection.bind('all', this.re_render, this);
    },
    render: function(){
        if(this.collection.length){
            this.$el.html(this.template({
                photos: this.collection.models
            }));
            this.$el.addClass('thumbs');
        }
        return this;
    },
    re_render: function(){
        if(this.collection.length){

            this.render();

            // if the scroller is set up, refresh it
            if(this.stream.scroller){
                scroller = this.stream.scroller;
                setTimeout(function () {
                    scroller.refresh();
                }, 0);
            }
            console.log("photoswipe from re-render");
            this.stream.photoswipe_init();
        }
        return this;
    }

});


snapr.views.dash = snapr.views.page.extend({

    initialize: function(){

        snapr.views.page.prototype.initialize.call( this );

        this.change_page();

        this.collection = new snapr.models.dash();
        this.populate();

    },

    populate: function()
    {
        var dash = this;
        var options = {
            data: {n:6, feed:true},
            success: function(){
                dash.render();
            },
            error:function(){
                console.error('Error loading dash from server');
            },
            complete: function(){
                $.mobile.hidePageLoadingMsg();
            }
        };

        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();

        this.collection.fetch( options );
    },

    render: function()
    {
        var dash = this,
            streams = this.$el.find('.image-streams');

        streams.empty();

        _.each( this.collection.models, function( item ){

            var li = new snapr.views.dash_stream({ model: item }),
                stream_el = li.render().$el,
                pull_distance = -40,
                left_pull_el = $('.left-pull', stream_el),
                right_pull_el = $('.right-pull', stream_el);
            li.photoswipe_init();
            streams.append( stream_el );
            function flip_pulls(scroller){
                //console.log(scroller.x, scroller.maxScrollX);
                left_pull_el.toggleClass('flipped', scroller.x > pull_distance);
                right_pull_el.toggleClass('flipped', scroller.x < (scroller.maxScrollX - pull_distance));
            }
            try{
                li.scroller = new iScroll($('.n-horizontal-scroll', stream_el)[0], {
                    vScroll: false,
                    hScrollbar: false,
                    snap: 'a.image-link, .left-pull',
                    momentum: false,
                    onScrollEnd: function(){
                        var details = $(this.wrapper).prev(),
                            curr = $('a.image-link', this.wrapper).eq(this.currPageX);

                        details.find('.image-tag').text(curr.data('description'));
                        details.find('.x-date').text(snapr.utils.short_timestamp(curr.data('date')));

                        // Pull to refresh: if scroll elements are .flipped - refresh
                        if(left_pull_el.is('.flipped')){
                            stream_el.addClass('loading');
                            scroller = this;
                            item.photos.fetch_newer({success: function(){
                                if(scroller.currPageX === 0){
                                    scroller.scrollToPage(1);
                                }
                                stream_el.removeClass('loading');
                            }});
                        }else if(right_pull_el.is('.flipped')){
                            stream_el.addClass('loading');
                            scroller = this;
                            item.photos.fetch_older({success: function(){
                                if(scroller.currPageX === scroller.pagesX.length){
                                    scroller.scrollToPage(scroller.pagesX.length - 1);
                                }
                                stream_el.removeClass('loading');
                            }});
                        }

                        flip_pulls(this);
                    },
                    onScrollMove: function () {
                        flip_pulls(this);
                    }
                });
                li.scroller.scrollToPage(1);
                window.sc = window.sc || li.scroller;
            }catch(err){

            }

        }, this);

        this.$el.trigger( "create" );

    }

});
