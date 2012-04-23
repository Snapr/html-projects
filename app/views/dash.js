snapr.views.dash_stream = snapr.views.side_scroll.extend({
    id: 'dash',
    template: _.template( $('#dash-stream-template').html() ),
    thumbs_template: _.template( $('#dash-thumbs-template').html() )
});


snapr.views.dash = Backbone.View.extend({

    el: $('#dashboard'),
    initialize: function(){
        this.$el.live('pagehide', function( e ){
            $(e.target).undelegate();
            return true;
        });

        $.mobile.changePage( $("#dashboard"), {
            changeHash: false
        });

        $('a[data-query]', this.$el).live('click', function( e ){
            var query = $(this).data('query'),
                current = $(this).data('current');
            Route.navigate('#/feed/?'+unescape(query)+'&photo_id='+current);

        });

        this.collection = new snapr.models.dash();
        this.populate();

    },
    populate: function(){
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
    render: function(){
        var streams = this.$el.find('.image-streams');
        streams.empty();

        _.each( this.collection.models, function( item ){
            var li = new snapr.views.dash_stream({ collection: item.photos, model: item });
            streams.append( li.el );
            li.render();
        }, this);

        this.$el.trigger( "create" );

    }

});
