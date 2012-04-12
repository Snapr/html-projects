snapr.views.dash_stream = Backbone.View.extend({

    template: _.template( $('#dash-stream-template').html() ),
    render: function(){
        this.photos = new snapr.views.dash_stream_thumbs({collection: this.model.photos});
        this.photos.stream = this;
        this.photos.render();
        this.el = $(this.template( {
            stream: this.model
        } ));
        $(this.photos.el).insertAfter($(this.el).find('.left-pull'));
        return this;
    }

});

snapr.views.dash_stream_thumbs = Backbone.View.extend({

    template: _.template( $('#dash-thumbs-template').html() ),
    initialize: function() {
        this.collection.bind('all', this.render, this);
    },
    render: function(){
        if(this.collection.length){
            html = this.template({
                photos: this.collection.models
            });
            $(this.el).html(html).addClass('thumbs');

            // if the scroller is set up, refresh it
            if(this.stream.scroller){
                scroller = this.stream.scroller;
                setTimeout(function () {
                    scroller.refresh();
                }, 0);
            }
        }
        return this;
    }

});


snapr.views.dash = Backbone.View.extend({

    el: $('#dashboard'),

    events: {
       // "click #popular-timeframe a":"update_list"
    },

    initialize: function(){
        this.el.live('pagehide', function( e ){
            $(e.target).undelegate();
            return true;
        });

        $.mobile.changePage( $("#dashboard"), {
            changeHash: false
        });

        this.collection = new snapr.models.dash();
        this.populate();

    },
    populate: function(){
        var dash = this;
        this.collection.data = {n:6, feed:true}; //, nearby:true};
        var options = {
            success: function(){

                dash.render();

                // feed_view.feed_list.render( feed_view.photoswipe_init );
                $.mobile.hidePageLoadingMsg();
            },
            error:function(){
                console.error('Error loading dash from server');
                $.mobile.hidePageLoadingMsg();
            }
        };

        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();

        this.collection.fetch( options );
    },
    render: function(){
        var dash = this,
            streams = this.el.find('.image-streams');

        streams.empty();

        _.each( this.collection.models, function( item ){
            var li = new snapr.views.dash_stream({ model: item }),
                stream_el = li.render().el,
                pull_distance = 20,
                left_pull_el = $('.left-pull', stream_el),
                right_pull_el = $('.right-pull', stream_el);
            streams.append( stream_el );
            function flip_pulls(scroller){
                left_pull_el.toggleClass('flipped', scroller.x > pull_distance);
                right_pull_el.toggleClass('flipped', scroller.x < (scroller.maxScrollX - pull_distance));
            }
            try{
                li.scroller = new iScroll($('.n-horizontal-scroll', stream_el)[0], {
                    vScroll: false,
                    hScrollbar: false,
                    snap: 'a.image-link',
                    momentum: false,
                    onScrollEnd: function(){
                        var details = $(this.wrapper).prev(),
                            curr = $('a.image-link', this.wrapper).eq(this.currPageX);

                        details.find('.image-tag').text(curr.data('description'));
                        details.find('.x-date').text(snapr.utils.short_timestamp(curr.data('date')));

                        // Pull to refresh: if scroll elements are .flipped - refresh
                        if(left_pull_el.is('.flipped')){
                            item.photos.fetch_newer();
                        }else if(right_pull_el.is('.flipped')){
                            item.photos.fetch_older();
                        }

                        flip_pulls(this);
                    },
                    onScrollMove: function () {
                        flip_pulls(this);
                    }
                });
            }catch(err){

            }

        }, this);

        this.el.trigger( "create" );
    }

});
