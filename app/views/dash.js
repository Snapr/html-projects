/*global _ Route define require */
define(['views/base/page', 'views/base/page', 'views/base/side_scroll',
    'models/dash', 'models/dash_stream', 'collections/user',
    'views/components/no_results', 'views/people_li', 'utils/geo', 'auth'],
    function(page_view, page_view, side_scroll, dash_model, dash_stream_model,
        user_collection, no_results, people_li, geo, auth){

var dash_view = page_view.extend({

    el: $('#dashboard'),

    post_initialize: function(){
        this.collection = new dash_model();
        window.dash = this.collection;

        this.collection.bind( 'remove', this.remove_stream );
        this.collection.bind( 'add', this.add_stream );
    },

    post_activate: function(){
        this.change_page();

        // make sure image streams are emptied
        this.$el.find('.image-streams').empty();

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
                    feed:!!auth.get("access_token")
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
        geo.get_location( success_callback, error_callback );
    },

    render: function(){
        this.$el.find('.dash-welcome').toggle(!auth.has("access_token") || this.collection.length < 3);
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
        auth.require_login( function()
        {
            snapr.info.current_view = new add_search({
                el: $("#dash-add-search")[0],
                back_view: dash_view
            });
        })();
    },

    add_person: function()
    {
        var dash_view = this;
        auth.require_login( function()
        {
            snapr.info.current_view = new add_person({
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

var add_person = page_view.extend({

    post_initialize: function(){
        var dialog = this;
        this.$el.live( "pageshow", function( e, ui )
        {
            dialog.$('#people-search').focus();
        });

        this.collection = new user_collection();

        this.collection.bind( "reset", function(){
            dialog.render();
        });

    },

    post_activate: function(){
        this.$el.find("ul.people-list").empty();
        this.$el.find(".ui-input-text").val('');

        this.change_page();
    },

    events: {
        "keyup input": "search"
    },

    render: function()
    {
        var people_list = this.$el.find("ul.people-list").empty();

        var people_li_template = _.template( $("#people-li-template").html() );

        if(this.collection.length){
            no_results.$el.remove();  // use remove(), hide() keeps it hidden and requires show() later
            _.each( this.collection.models, function( model ){
                var li = new people_li({
                    template: people_li_template,
                    model: model
                });

                people_list.append( li.render().el );
            });
        }else{
            no_results.render('Oops.. Nobody here yet.', 'delete').$el.appendTo(people_list);
        }

        var this_back = this.back;
        var this_back_view = this.back_view;
        people_list.find('a').click(function(e){
            e.preventDefault();
            var username = $(this).data('username'),
                stream = new dash_stream_model({
                    query: {
                        username: username
                    },
                    display: {
                        "title": "Photos by "+username,
                        "short_title": username,
                        "type": "search"
                    }
                });
            $.mobile.showPageLoadingMsg();
            stream.save({}, {success: function(){
                dash.add(stream);
                $.mobile.hidePageLoadingMsg();
            }});
            this_back_view.$el.removeClass('edit');
            this_back();
        });

        people_list.listview().listview("refresh");


    },

    search: function(e)
    {

        var keywords = $(e.target).val();
        var this_view = this;


        this.timer && clearTimeout(this.timer);
        this.xhr && this.xhr.abort();

        if (keywords.length > 1){

            this.timer = setTimeout( function() {
                this_view.timer = null;
                this_view.$el.addClass('loading');
                this_view.xhr = this_view.collection.fetch({
                    data:{
                        username:keywords,
                        n:20,
                        detail:1
                    },
                    url: snapr.api_base + '/user/search/',
                    success: function(){
                        this_view.xhr = null;
                        this_view.$el.removeClass('loading');
                    }
                });
            }, 300 );

        }else{
            if(this_view.collection.length){  // stops the list showing no-results on initial searches
                this_view.collection.reset();
            }
        }
    }

});

var add_search = page_view.extend({

    post_initialize: function(){
        var dialog = this;
        this.$el.live( "pageshow", function( e, ui )
        {
            dialog.$('#dash-search-keywords').focus();
        });

    },

    post_activate: function(){
        this.$el.find(".ui-input-text").val('');

        this.change_page();

        var dialog = this;
        this.$el.live( "pageshow", function( e, ui )
        {
            dialog.$('#dash-search-keywords').focus();
        });

    },

    events: {
        "submit #search-form": "search",
        "click .x-back": "back"
    },

    search: function(){
        var keywords = $("#dash-search-keywords").val();
        var nearby = $("#dash-search-type").val();

        var stream_object = {
            query: {
                keywords: keywords,
                nearby: !!nearby
            },
            display: {
                "title": "Search for "+keywords,
                "short_title": keywords,
                "type": "search"
            }
        };

        if (nearby)
        {
            var add_search = this;
            stream_object.query.radius = nearby;

            var success_callback = function( position )
            {
                stream_object.query.latitude = position.coords.latitude;
                stream_object.query.longitude = position.coords.longitude;

                var stream = new dash_stream_model( stream_object );
                $.mobile.showPageLoadingMsg();
                stream.save({}, {success: function(){
                    dash.add(stream);
                    $.mobile.hidePageLoadingMsg();
                }});
                add_search.back_view.$el.removeClass('edit');
                add_search.back();
            };
            var error_callback = function( error )
            {
                console.warn( "error getting geolocation", error );
                if (error.message)
                {
                    snapr.utils.notification( error.message );
                }
            };
            geo.get_location( success_callback, error_callback );
        }
        else
        {
            var stream = new dash_stream_model( stream_object );
            $.mobile.showPageLoadingMsg();
            stream.save({}, {success: function(){
                dash.add(stream);
                $.mobile.hidePageLoadingMsg();
            }});
            this.back_view.$el.removeClass('edit');
            this.back();
        }

    }

});

return dash_view;

});
