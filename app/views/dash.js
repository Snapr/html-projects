/*global _ Route define require */
define(['views/base/page', 'views/base/side_scroll', 'models/dash'], function(page_view, side_scroll, dash_model){

var dash_stream = side_scroll.extend({

    tagName: 'li',

    className: 'image-stream',

    events: {
        "click .remove-stream": "remove_stream"
    },

    template: _.template( $('#dash-stream-template').html() ),

    thumbs_template: _.template( $('#dash-thumbs-template').html() ),

    post_initialize: function( options ){

        if (this.model.has("id"))
        {
            this.$el.addClass("user-stream");
            this.$el.attr("data-id", this.model.get("id"));
        }
    },

    remove_stream: function(){
        var stream = this;
        snapr.utils.approve({
            title: 'Are you sure you want to remove this stream?',
            yes_callback: function()
            {
                stream.model['delete']({
                    success: function()
                    {
                        stream.model.collection.remove(stream.model);
                        console.log(stream.model.collection===stream.collection);
                    }
                });
            }
        });
    }
});

return page_view.extend({

    el: $('#dashboard'),

    post_initialize: function(){
        this.change_page();

        // make sure image streams are emptied
        this.$el.find('.image-streams').empty();

        this.collection = new dash_model();
        window.dash = this.collection;

        this.collection.bind( 'remove', this.remove_stream );
        this.collection.bind( 'add', this.add_stream );
        this.populate();
    },

    events: {
        "click .x-add-search": "add_search",
        "click .x-add-person": "add_person",
        "click .x-edit-dash": "edit_dash",
        "click a[data-query]": "data_query_link"
    },

    populate: function(){
        var dash = this,
            options = {
                data: {
                    n:6,
                    detail:0,
                    feed:!!snapr.auth.get("access_token")
                },
                success: function()
                {
                    dash.render();
                },
                error: function()
                {
                    console.error('Error loading dash from server');
                },
                complete: function()
                {
                    $.mobile.hidePageLoadingMsg();
                }
            };

        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();

        var success_callback = function( location ){
            options.data.latitude = location.coords.latitude;
            options.data.longitude = location.coords.longitude;
            options.data.nearby = true;
            dash.collection.fetch( options );
        };

        var error_callback = function(){
            dash.collection.fetch( options );
        };
        snapr.geo.get_location( success_callback, error_callback );
    },

    render: function(){
        this.$el.find('.dash-welcome').toggle(!snapr.auth.has("access_token") || this.collection.length < 3);
        var $streams = this.$el.find('.image-streams').empty();
        _.each( this.collection.models, function( item )
        {
            var li = new dash_stream({
                collection: item.photos,
                model: item
            });
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

    edit_dash: function()
    {
        this.$el.toggleClass('edit');
    },

    data_query_link: function( e )
    {
        var query = $(e.currentTarget).data('query');
        var current = $(e.currentTarget).data('current');
        Route.navigate('#/feed/?' + unescape( query ) + '&photo_id=' + current );
    },

    remove_stream: function(stream){
        this.$el.find('.image-stream[data-id='+stream.get('id')+']').remove();
    },
    add_stream: function(item){
        var li = new dash_stream({ collection: item.photos, model: item });
        this.$el.find('.image-streams').append( li.el );
        // this must be rendered after it's appended because sizing details
        // needed by scroller are only available after the element is in the DOM
        li.render();
        li.$el.trigger('create');
    }

});

});
