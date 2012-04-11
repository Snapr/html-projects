snapr.views.dash_stream = Backbone.View.extend({

    template: _.template( $('#dash-stream-template').html() ),
    render: function(){
        this.el = $(this.template( {
            stream: this.model
        } ));
        return this;
    }

});

snapr.views.dash = Backbone.View.extend({

    el: $('#dashboard'),

    events: {
       // "click #popular-timeframe a":"update_list"
    },

    initialize: function(){
        this.el.live('pagehide', function( e )
        {
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
        console.log('this is clearly not cached2');
        this.collection.data = {n:6, feed:true}; //, nearby:true};
        var options = {
            success: function(){

                dash.render();

               //  feed_view.feed_list.render( feed_view.photoswipe_init );
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
                new iScroll($('.n-horizontal-scroll', stream_el)[0], {
                    vScroll: false,
                    hScrollbar: false,
                    snap: 'a.image-link',
                    momentum: false,
                    onScrollEnd: function(){
                        var details = $(this.wrapper).prev(),
                            curr = $('a.image-link', this.wrapper).eq(this.currPageX);

                        details.find('.image-tag').text(curr.data('description'));
                        details.find('.x-date').text(curr.data('date'));

                        // Pull to refresh: if scroll elements are .flipped - refresh
                        console.log(left_pull_el.is('.flipped'), right_pull_el.is('.flipped'));

                        if(left_pull_el.is('.flipped')){
                            console.log('loading newer');
                        }
                        if(right_pull_el.is('.flipped')){
                            console.log('loading more');
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
