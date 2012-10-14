/*global _  define require */
define(['config', 'backbone', 'views/base/view', 'views/base/page', 'views/base/side_scroll',
    'models/dash', 'models/dash_stream', 'collections/user', 'collections/tumblr_post',
    'views/components/no_results', 'views/people_li', 'views/tumblr_item',
    'utils/geo', 'auth', 'utils/alerts', 'utils/query'],
    function(config, Backbone, view, page_view, side_scroll, dash_model, dash_stream_model,
        user_collection, tumblr_post_collection, no_results,
        people_li, tumblr_item_view, geo, auth, alerts, Query){

var dash_view = page_view.extend({

    el: $('#dashboard'),

    post_initialize: function(){
        this.model = new dash_model();

        // Jon, why are these commented out?
        //this.model.get('streams').bind( 'remove', this.remove_stream );
        //this.model.get('streams').bind( 'add', this.add_stream );
    },

    post_activate: function(){
        this.change_page();

        // make sure image streams are emptied
        this.$('.image-streams').empty();

        this.populate();
    },

    events: {
        "click .x-add-search": "add_search",
        "click .x-add-person": "add_person",
        "click .x-edit-dash": "edit_dash"
    },

    get_default_tab: function(){ return 'dash'; },

    populate: function(){

        $.mobile.showPageLoadingMsg();

        var dash = this,
            options = {
                data: {
                    n:0
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

        geo.get_location(
            function( location ){
                options.data.latitude = location.coords.latitude;
                options.data.longitude = location.coords.longitude;
                dash.model.fetch( options );
            },
            function(){
                console.warn('error getting location, not showing nearby stream');
                dash.model.fetch( options );
            }
        );
    },

    render: function(){
        this.$('.dash-welcome').toggle(!auth.has("access_token") || this.model.length < 3);

        var $competitions = this.$('.competitions').empty(),
            $featured_streams = this.$('.featured-streams').empty(),
            $tumblr_streams = this.$('.tumblr-streams').empty(),
            $streams = this.$('.user-streams').empty();

        // Competitions
        _.each( this.model.competitions, function( item ){
            var li = new competition({
                data: item,
                expand: true
            });
            $competitions.append( li.render().el );
        });

        // Featured streams
        _.each( this.model.featured_streams.models, function( item ){
            var li = new dash_stream({
                collection: item.photos,
                model: item,
                featured: true,
                expand: true
            });
            $featured_streams.append( li.el );
            li.render();  // render after inserting so DOM metrics are available
        });

        // Tumblr
        _.each( this.model.tumblr_feeds, function ( item ){
            var li = new dash_tumblr_view({
                feed: item
            });
            $tumblr_streams.append( li.render().el );
        });

        // User streams
        _.each( this.model.streams.models, function( item ){
            var li = new dash_stream({
                collection: item.photos,
                model: item
            });
            $streams.append( li.render().el );
        });

        this.$el.trigger( "create" );
    },

    add_search: function(){
        var dash_view = this;
        auth.require_login( function(){
            var add = new add_search({
                el: $("#dash-add-search")[0],
                dialog: true
            });
            add.previous_view = config.get('current_view');
            config.set('current_view', add);
        })();
    },

    add_person: function(){
        var dash_view = this;
        auth.require_login( function(){
            var add = new add_person({
                el: $("#dash-add-person")[0],
                dialog: true
            });
            add.previous_view = config.get('current_view');
            config.set('current_view', add);
        })();
    },

    edit_dash: function(){
        this.$el.toggleClass('edit');
    },

    data_query_link: function( e ){
        var query = $(e.currentTarget).data('query');
        var current = $(e.currentTarget).data('current');
        Backbone.history.navigate('#/feed/?' + unescape( query ) + '&paginate_from=' + current );
    }//,

    // remove_stream: function(stream){
    //     this.$('.image-stream[data-id='+stream.get('id')+']').remove();
    // },
    // add_stream: function(item){
    //     var li = new dash_stream({ collection: item.photos, model: item });
    //     this.$('.image-streams').append( li.el );
    //     // this must be rendered after it's appended because sizing details
    //     // needed by scroller are only available after the element is in the DOM
    //     li.render();
    //     li.$el.trigger('create');
    // }

});

var competition = view.extend({
    tagName: 'li',
    className: 'competition',
    events: {
        "click .x-details": "toggle"
    },
    initialize: function ( options ) {
        this.load_template('components/dash/competition');
    },
    render: function(){
        this.$el.addClass('closed');
        this.$el.html( this.template(this.options.data));
        return this;
    },
    toggle: function(){
        this.$el.toggleClass('open closed');
        this.$el.toggleClass('top-left-arrow');
        this.$('.banner').fadeToggle();
    }
});

var dash_tumblr_view = view.extend({
    tagName: 'li',
    className: 'post-stream',
    events: {
        "click .x-details": "toggle"
    },
    initialize: function ( options ) {
        this.load_template('components/dash/tumblr');
    },
    render: function () {

        this.$el.addClass('open loading');
        this.$el.html( this.template({
            feed: this.options.feed,
            post: null
        }));

        var this_view = this,
            feed = this.options.feed,

            $tumblr_streams = this.$('.posts-stream').empty(),
            collection = new tumblr_post_collection(),
            options = {
                host: feed.host,
                key: feed.key,
                data: {
                    limit:1,
                    filter:'text'
                },
                success: function(){
                    if (collection.length) {
                        this_view.$el.html( this_view.template({
                            feed: feed,
                            post: collection.at(0)
                        })).trigger('create');
                    }
                    this_view.$el.removeClass('loading');
                },
                error: function(){
                    console.error('Error loading tumblr posts from server');
                }
            };
        collection.fetch(options);
        return this;
    },
    toggle: function () {
        this.$el.toggleClass('open closed');
        this.$el.toggleClass('top-left-arrow');
        this.$('.posts-stream').fadeToggle();
    }
});

var dash_stream = side_scroll.extend({

    tagName: 'li',

    className: 'image-stream',

    events: {
        "click .remove-stream": "remove_stream",
        "click .x-details": "toggle_stream",
        "click .x-view-full": "goto_feed"
    },

    post_initialize: function( options ){
        this.template = this.get_template('components/dash/stream');
        this.thumbs_template = this.get_template('components/dash/thumb');
        if (!options.featured){
            this.$el.addClass("user-stream");
            this.$el.attr("data-id", this.model.get("id"));
        }
    },

    remove_stream: function(){
        var stream = this;
        alerts.approve({
            title: 'Are you sure you want to remove this stream?',
            yes_callback: function(){
                stream.model['delete']({
                    success: function(){
                        stream.collection.remove(stream.model);
                        stream.render();
                    }
                });
            }
        });
    },

    goto_feed: function(e){
        var button = $(e.currentTarget),
            query = button.data('query'),
            current = button.data('current');

        Backbone.history.navigate('#/feed/?' + unescape( query ));
    }
});

var add_person = page_view.extend({

    tempate_name: 'components/dash/add_person',

    post_initialize: function(){
        var dialog = this;
        this.$el.live( "pageshow", function( e, ui ){
            dialog.$('#people-search').focus();
        });

        this.collection = new user_collection();

        this.collection.bind( "reset", function(){
            dialog.render();
        });

    },

    post_activate: function(){
        this.$("ul.people-list").empty();
        this.$(".ui-input-text").val('');

        this.change_page();
    },

    events: {
        "keyup input": "search"
    },

    render: function(){
        var people_list = this.$("ul.people-list").empty();

        var people_li_template = this.get_template('components/person');

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
        var this_back_view = this.previous_view;
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
                dash.get('streams').add(stream);
                $.mobile.hidePageLoadingMsg();
            }});
            this_back_view.$el.removeClass('edit');
            this_back();
        });

        people_list.listview().listview("refresh");


    },

    search: function(e){

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
                    url: config.get('api_base') + '/user/search/',
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

    tempate_name: 'components/dash/add_search',

    post_initialize: function(){
        var dialog = this;
        this.$el.live( "pageshow", function( e, ui ){
            dialog.$('#dash-search-keywords').focus();
        });

    },

    post_activate: function(){
        this.$(".ui-input-text").val('');

        this.change_page();
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

        if (nearby){
            var add_search = this;
            stream_object.query.radius = nearby;

            var success_callback = function( position ){
                stream_object.query.latitude = position.coords.latitude;
                stream_object.query.longitude = position.coords.longitude;

                var stream = new dash_stream_model( stream_object );
                $.mobile.showPageLoadingMsg();
                stream.save({}, {success: function(){
                    dash.get('streams').add(stream);
                    $.mobile.hidePageLoadingMsg();
                }});
                add_search.previous_view.$el.removeClass('edit');
                add_search.back();
            };
            var error_callback = function( error ){
                console.warn( "error getting geolocation", error );
                if (error.message){
                    alerts.notification( error.message );
                }
            };
            geo.get_location( success_callback, error_callback );
        }else{
            var stream = new dash_stream_model( stream_object );
            $.mobile.showPageLoadingMsg();
            stream.save({}, {success: function(){
                dash.get('streams').add(stream);
                $.mobile.hidePageLoadingMsg();
            }});
            this.previous_view.$el.removeClass('edit');
            this.back();
        }

    }

});

return dash_view;

});
