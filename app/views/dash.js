/*global _  define require */
define([
        'config',
        'backbone',
        'auth',

        'views/base/view',
        'views/base/page',
        'views/base/side_scroll',
        'views/people_li',
        'views/components/no_results',

        'models/dash',
        'models/dash_stream',

        'collections/user',
        'collections/tumblr_post',

        'utils/geo',
        'utils/alerts',
        'utils/query'
    ],
    function(
        config,
        Backbone,
        auth,

        view,
        page_view,
        side_scroll,
        people_li,
        no_results,

        dash_model,
        dash_stream_model,

        user_collection,
        tumblr_post_collection,

        geo,
        alerts,
        Query
    ){

var dash_view = page_view.extend({

    post_initialize: function(){
        this.model = new dash_model();

        this.model.streams.bind( 'remove', this.remove_stream );
        this.model.featured_streams.bind( 'remove', this.remove_featured_stream );
        this.model.streams.bind( 'add', this.add_stream );
        this.model.featured_streams.bind( 'add', this.add_featured_stream );

        this.rendered = false;

        var dash = this;
        auth.on('logout login', function(){
            // commit suicide on logout/in to force full reload
            dash.uncache();
        });
    },

    post_activate: function(){
        this.change_page();

        if(this.rendered){
            this.background_update();
        }else{
            this.populate();
        }

    },

    events: {
        "click .x-add-search": "add_search",
        "click .x-add-person": "add_person",
        "click .x-edit-dash": "edit_dash"
    },

    get_override_tab: function(){ return 'dash'; },

    populate: _.once(function(){

        $.mobile.showPageLoadingMsg();

        var dash = this;
        this.fetch(function(){
            dash.render();
        });
    }),

    background_update: function(){

        if(this.background_updating){ return; }
        this.background_updating = true;

        this.$el.addClass('x-background-loading');

        var dash = this,
            current = {
                streams: _.keys(this.model.streams._byId),
                featured_streams: _.keys(this.model.featured_streams._byId),
                competitions: _(this.model.competitions).pluck('id'),
                tumblr_feeds: _.chain(this.model.tumblr_feeds).pluck('display').pluck('id').value()
            };

        this.fetch(function(){

            //remove competitions
            _.each(current.competitions, function(comp){
                if(!_.contains(_(dash.model.competitions).pluck('id'), comp)){
                    dash.$('.x-competitions [data-id='+comp+']').remove();
                }
            });

            //add competitions
            dash.add_comps(_.reject(dash.model.competitions, function(comp){
                return _.contains(current.competitions, comp.id);
            }));

            //remove OR UPDATE tumblr feeds
            _.each(current.tumblr_feeds, function(feed){
                if(!_.contains(_.chain(dash.model.tumblr_feeds).pluck('display').pluck('id').value(), feed)){
                    dash.$('.x-tumblr-streams [data-id='+feed+']').remove();
                }else{
                    dash.tumblr_views[feed].update();
                }
            });

            //add tumblr feeds
            dash.add_tumblrs(_.reject(dash.model.tumblr_feeds, function(feed){
                return _.contains(current.tumblr_feeds, feed.display.id);
            }));

            //remove streams
            _.each(current.streams, function(stream){
                if(!dash.model.streams._byId[stream]){
                    dash.remove_stream(stream);
                }
            });

            //add streams
            dash.add_streams(_.reject(dash.model.streams.models, function(stream){
                return _.contains(current.streams, ''+stream.id);
            }));

            //remove featured_streams
            _.each(current.featured_streams, function(stream){
                if(!dash.model.featured_streams._byId[stream]){
                    dash.$('.x-featured-streams [data-id='+stream+']').remove();
                }
            });

            //add featured_streams
            dash.add_featured_streams(_.reject(dash.model.featured_streams.models, function(stream){
                return _.contains(current.featured_streams, ''+stream.id);
            }));

            dash.$el.trigger( "create" );
        });
    },

    fetch: function(success){

        var dash = this,
            options = {
                data: {
                    n:0,
                    access_token: auth.get('access_token')
                },
                success: success,
                error: function(){
                    console.error('Error loading dash from server');
                },
                complete: function(){
                    $.mobile.hidePageLoadingMsg();
                    dash.$el.removeClass('x-background-loading');
                    dash.background_updating = false;
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
        this.$('.x-dash-welcome').toggle(!auth.has("access_token") || this.model.length < 3);

        this.$('.x-user-streams').empty();

        this.add_comps(this.model.competitions);
        this.add_featured_streams(this.model.featured_streams.models);
        this.add_tumblrs(this.model.tumblr_feeds);
        this.add_streams(this.model.streams.models);

        this.$('.x-add-buttons').show();

        this.$el.trigger( "create" );

        this.rendered = true;
        return this;
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
        this.$el.toggleClass('x-edit');
    },

    data_query_link: function( e ){
        var query = $(e.currentTarget).data('query');
        var current = $(e.currentTarget).data('current');
        Backbone.history.navigate('#/feed/?' + unescape( query ) + '&paginate_from=' + current );
    },

    remove_stream: function(stream){
        if(stream.id){
            stream = stream.id;
        }
        this.$('.x-user-streams [data-id='+stream+']').remove();
    },

    remove_featured_stream: function(stream){
        if(stream.id){
            stream = stream.id;
        }
        this.$('.x-featured-streams [data-id='+stream+']').remove();
    },
    add_stream: function(item){
        this.add_streams([item]);
    },

    add_streams: function(items){
        if(this.options.show && !_.contains(this.options.show, 'user-streams')){ return; }

        var container = this.$('.x-user-streams'),
            parent_view = this;

        _.each(items, function(item){
            var li = new dash_stream({
                collection: item.photos,
                model: item,
                parent_view: parent_view,
                use_gallery: false
            });
            container.append( li.render().el );
        });
        container.trigger('create');
    },
    add_comps: function(items){
        if(this.options.show && !_.contains(this.options.show, 'comps')){ return; }

        var container = this.$('.x-competitions');

        _.each(items, function(item){
            var li = new competition({
                data: item,
                expand: true
            });
            container.append( li.render().el );
        });
    },
    tumblr_views: {},
    add_tumblrs: function(items){
        if(this.options.show && !_.contains(this.options.show, 'tumblr')){ return; }

        var dash = this,
            container = this.$('.x-tumblr-streams');

        _.each(items, function(item){
            dash.tumblr_views[item.display.id] = new dash_tumblr_view({
                feed: item
            });
            container.append( dash.tumblr_views[item.display.id].render().el );
        });
    },
    add_featured_stream: function(item){
        this.add_featured_streams([item]);
    },
    add_featured_streams: function(items){
        if(this.options.show && !_.contains(this.options.show, 'featured-streams')){ return; }

        var container = this.$('.x-featured-streams'),
            parent_view = this;

        _.each(items, function(item){
            if(item.get('display').view && item.get('display').view != parent_view.options.name){ return; }
            var li = new dash_stream({
                collection: item.photos,
                model: item,
                featured: true,
                expand: true,
                parent_view: parent_view,
                use_gallery: false
            });
            container.append( li.el );
            li.render();  // render after inserting so DOM metrics are available
        });
    }

});

var competition = view.extend({
    tagName: 'article',
    className: 'competition',
    events: {
        "click .x-details": "toggle"
    },
    initialize: function ( options ) {
        this.load_template('components/dash/competition');
    },
    render: function(){
        this.$el.addClass( this.options.expand ? 'x-open' : 'x-closed' );
        this.$el.html( this.template(this.options) );
        this.$el.attr('data-id', this.options.data.id);
        return this;
    },
    toggle: function(){
        this.$el.toggleClass('x-open x-closed');
        this.$el.toggleClass('s-arrow-d-left');
        this.$('.banner').fadeToggle();
    }
});

var dash_tumblr_view = view.extend({
    tagName: 'article',
    className: 'x-post-stream',
    events: {
        "click .x-details": "toggle"
    },
    initialize: function ( options ) {
        this.load_template('components/dash/tumblr');
    },
    render: function () {

        this.$el.addClass('x-open x-loading');
        this.$el.html( this.template({
            feed: this.options.feed,
            posts: []
        }));

        this.update();
        return this;
    },
    toggle: function() {
        this.$el.toggleClass('x-open x-closed');
        this.$('.x-posts').fadeToggle();
    },
    update: function(){
        var this_view = this,
        feed = this.options.feed,

        collection = new tumblr_post_collection(),
        options = {
            host: feed.host,
            key: feed.key,
            data: {
                limit:config.get('dash_tumblr_posts'),
                filter:'text'
            },
            success: function(){
                this_view.$('.x-posts').empty();
                if (collection.length) {
                    this_view.$el.html( this_view.template({
                        feed: feed,
                        posts: collection.models
                    })).trigger('create');
                    this_view.$el.attr('data-id', feed.display.id);
                }
                this_view.$el.removeClass('loading');
            },
            error: function(){
                console.error('Error loading tumblr posts from server');
            }
        };
        collection.fetch(options);
    }
});

var dash_stream = side_scroll.extend({

    tagName: 'article',

    className: 'x-stream',

    events: _.extend({
        "click .x-remove-stream": "remove_stream"
    }, side_scroll.prototype.events),

    get_title: function(){
        var title = this.model.get("display").short_title;
        if(this.model.get("query").username){
            title = title.replace(this.model.get("query").username, '<span class="at">@</span>' + this.model.get("query").username);
        }
        if(this.model.get("query").keywords){
            title = title.replace(this.model.get("query").keywords, '<span class="hash">#</span>' + this.model.get("query").keywords);
        }
        if(this.model.get("query").radius){
            title = title +  ' <span class="radius">(' + this.model.get("query").radius/1000 +'km)</span>';
        }
        return title;
    },

    post_initialize: function( options ){
        if (!options.featured){
            this.$el.addClass("user-stream");
            this.$el.attr("data-id", this.model.get("id"));
        }
        this.$el.attr('data-id', this.model.id);
    },

    remove_stream: function(){
        var stream = this;
        alerts.approve({
            title: 'Are you sure you want to remove this stream?',
            yes_callback: function(){
                stream.model['delete']({
                    success: function(){
                        stream.collection.remove(stream.model);
                        stream.$el.remove();
                    }
                });
            }
        });
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
        this.$(".x-people-list").empty();
        this.$(".ui-input-text").val('');

        this.change_page();
    },

    events: {
        "keyup input": "search"
    },

    render: function(){
        var people_list = this.$(".x-people-list").empty();

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
            no_results.render('Oops.. Nobody here yet.', 'delete').$el.insertBefore(people_list);
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
            stream.save({}, {success: function(model, r){
                if(r.error){
                    if(r.error.type == 'duplicate'){
                        alerts.notification('You already have this user on your dashboard');
                    }else{
                        alerts.notification(r.error.message);
                    }
                }else{
                    this_back_view.model.streams.add(stream);
                }
                $.mobile.hidePageLoadingMsg();
            }});
            this_back_view.$el.removeClass('x-edit');
            this_back();
            $.mobile.showPageLoadingMsg();
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
                this_view.$el.addClass('x-loading');
                this_view.xhr = this_view.collection.fetch({
                    data:{
                        username:keywords,
                        n:20,
                        detail:1
                    },
                    url: config.get('api_base') + '/user/search/',
                    success: function(){
                        this_view.xhr = null;
                        this_view.$el.removeClass('x-loading');
                    }
                });
            }, 300 );

        }else{
            if(this_view.collection.length){  // stops the list showing x-no-results on initial searches
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
        var keywords = this.$("input.x-search-field").val();
        var nearby = this.$("select.x-search-distance").val();

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
                stream.save({}, {success: function(model, r){
                    if(r.error){
                        if(r.error.type == 'duplicate'){
                            alerts.notification('You already have this search on your dashboard');
                        }else{
                            alerts.notification(r.error.message);
                        }
                    }else{
                        add_search.previous_view.model.streams.add(stream);
                    }
                    $.mobile.hidePageLoadingMsg();
                }});
                add_search.previous_view.$el.removeClass('x-edit');
                add_search.back();

                $.mobile.showPageLoadingMsg();
            };
            var error_callback = function( error ){
                console.warn( "error getting geolocation", error );
                if (error.message){
                    alerts.notification( error.message );
                }
            };
            geo.get_location( success_callback, error_callback );
        }else{
            var stream = new dash_stream_model( stream_object ),
                dash = this.previous_view;
            stream.save({}, {success: function(model, r){
                if(r.error){
                    if(r.error.type == 'duplicate'){
                        alerts.notification('You already have this search on your dashboard');
                    }else{
                        alerts.notification(r.error.message);
                    }
                }else{
                    dash.model.streams.add(stream);
                }
                $.mobile.hidePageLoadingMsg();
            }});
            this.previous_view.$el.removeClass('x-edit');
            this.back();

            $.mobile.showPageLoadingMsg();
        }

    }

});

return dash_view;

});
