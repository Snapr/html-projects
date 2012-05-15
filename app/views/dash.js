snapr.views.dash_stream = snapr.views.side_scroll.extend({
    id: 'dash',
    template: _.template( $('#dash-stream-template').html() ),
    thumbs_template: _.template( $('#dash-thumbs-template').html() ),
    initialize: function(options){
        snapr.views.side_scroll.prototype.initialize.call(this, options);
        var stream = this;
        $('.remove-stream', this.$el).live('click', function(){
            snapr.utils.approve({
                title: 'Are you sure you want to delete this stream?',
                yes_callback: function(){
                    window.s = stream;
                    stream.model.delete({success:function(){
                        stream.model.collection.remove(stream.model);
                        console.log(stream.model.collection===stream.collection);
                    }});
                }
            });
        });
    }
});


snapr.views.dash = snapr.views.page.extend({

    el: $('#dashboard'),

    initialize: function(){
        snapr.views.page.prototype.initialize.call( this );

        this.change_page();

        $('a[data-query]', this.$el).live( 'click', function( e ){
            var query = $(this).data('query'),
                current = $(this).data('current');
            Route.navigate('#/feed/?' + unescape( query ) + '&photo_id=' + current );
        });

        var dash_el = this.$el;
        $('.x-edit-dash', this.$el).live('click', function(){
            dash_el.toggleClass('edit');
        });

        // make sure image streams are emptied
        this.$el.find('.image-streams').empty();

        this.collection = new snapr.models.dash();
        window.dash = this.collection;
        //this.collection.bind('all', this.render, this);
        this.collection.bind('remove', this.remove_stream, this);
        this.collection.bind('add', this.add_stream, this);
        this.populate();
    },

    events: {
        "click .x-add-search": "add_search",
        "click .x-add-person": "add_person"
    },

    populate: function(){
        var dash = this,
            options = {
                data: {
                    n:6,
                    feed:!!snapr.auth.get("access_token")
                },
                success: function(){
                    dash.render();
                },
                error: function(){
                    console.error('Error loading dash from server');
                },
                complete: function(){
                    $.mobile.hidePageLoadingMsg();
                }
            };

        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();

        snapr.geo.get_location( function(location){
            options.data.latitude = location.coords.latitude;
            options.data.longitude = location.coords.longitude;
            options.data.nearby = true;
            dash.collection.fetch( options );
        }, function(e){
            dash.collection.fetch( options );
        } );
    },

    render: function(){
        this.$el.find('.dash-welcome').toggle(!snapr.auth.has("access_token") || this.collection.length < 3);
        var $streams = this.$el.find('.image-streams').empty();
        _.each( this.collection.models, function( item ){
            console.log(item);
            var li = new snapr.views.dash_stream({ collection: item.photos, model: item });
            $streams.append( li.el );
            // this must be rendered after it's appended because sizing details
            // needed by scroller are only available after the element is in the DOM
            li.render();
        }, this);

        this.$el.trigger( "create" );
    },

    add_search: function()
    {
        var dash_view = this;
        snapr.utils.require_login( function()
        {
            snapr.info.current_view = new snapr.views.dash_add_search({
                el: $("#dash-add-search")[0],
                back_view: dash_view
            });
        })();
    },

    add_person: function()
    {
        var dash_view = this;
        snapr.utils.require_login( function()
        {
            snapr.info.current_view = new snapr.views.dash_add_person({
                el: $("#dash-add-person")[0],
                back_view: dash_view
            });
        })();
    },

    remove_stream: function(stream){
        this.$el.find('.image-stream[data-id='+stream.get('id')+']').remove();
    },
    add_stream: function(item){
        var li = new snapr.views.dash_stream({ collection: item.photos, model: item });
        this.$el.find('.image-streams').append( li.el );
        // this must be rendered after it's appended because sizing details
        // needed by scroller are only available after the element is in the DOM
        li.render();
        li.$el.trigger('create');
    }

});
