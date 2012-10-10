/*global _  define require */
define(['config', 'backbone', 'views/base/view', 'views/base/page', 'views/base/side_scroll',
    'models/dash', 'models/dash_stream', 'collections/user', 'collections/dash_tumblr_feed',
    'collections/tumblr_post', 'views/components/no_results', 'views/people_li', 'views/tumblr_item',
    'utils/geo', 'auth', 'utils/alerts', 'utils/query'],
    function(config, Backbone, view, page_view, side_scroll, dash_model, dash_stream_model,
        user_collection, dash_tumblr_feed_collection, tumblr_post_collection, no_results,
        people_li, tumblr_item_view, geo, auth, alerts, Query){

var dash_view = page_view.extend({

    el: $('#dashboard'),

    post_initialize: function(){
        this.model = new dash_model();
        // TODO: don't store the collectin on window
        window.dash = this.model;

        //this.model.get('streams').bind( 'remove', this.remove_stream );
        //this.model.get('streams').bind( 'add', this.add_stream );
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
        "click .x-edit-dash": "edit_dash"
    },

    get_default_tab: function(){ return 'dash'; },

    populate: function(){
        var dash = this,
            options = {
                data: {
                    n:0,
                    feed:!!auth.get("access_token")
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

        $.mobile.showPageLoadingMsg();

        var success_callback = function( location ){
            options.data.latitude = location.coords.latitude;
            options.data.longitude = location.coords.longitude;
            options.data.nearby = true;
            dash.model.fetch( options );
        };

        var error_callback = function(){
            dash.model.fetch( options );
        };
        geo.get_location( success_callback, error_callback );
    },

    render: function(){
        this.$el.find('.dash-welcome').toggle(!auth.has("access_token") || this.model.length < 3);
        var $featured_streams = this.$el.find('.featured-streams').empty(),
            $tumblr_streams = this.$el.find('.tumblr-streams').empty(),
            $streams = this.$el.find('.user-streams').empty();

        // Featured streams
        _.each( this.model.get('featured_streams').models, function( item ){
            var li = new dash_stream({
                collection: item.photos,
                model: item,
                featured: true,
                expand: true
            });
            $featured_streams.append( li.el );
            // this must be rendered after it's appended because sizing details
            // needed by scroller are only available after the element is in the DOM
            li.render();
        }, this);

        // Tumblr

        _.each( this.model.get('tumblr_feeds').models, function ( item ){
            var li = new dash_tumblr_view({
                model: item
            });
            $tumblr_streams.append( li.el );
            li.render();
        }, this);

        // User streams
        _.each( this.model.get('streams').models, function( item ){
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

var dash_tumblr_view = view.extend({
    tagName: 'li',
    className: 'post-stream',
    events: {
        "click a.ui-bar": "toggle_feed"
    },
    initialize: function ( options ) {
        this.load_template('components/dash/tumblr');
    },
    render: function () {
        this.$el.html( this.template({
            model: this.model
        }));
        var tumblr_host = this.model.get('host'),
            tumblr_key = this.model.get('key'),
            $tumblr_streams = this.$el.find('.posts-stream').empty(),
            collection = new tumblr_post_collection(),
            options = {
                host: tumblr_host,
                key: tumblr_key,
                data: {
                    limit:1,
                    filter:'text'
                },
                success: function(){
                    if (collection.length) {
                        var li = new tumblr_item_view({
                            model: collection.at(0)
                        });
                        $tumblr_streams.append( li.el );
                        li.render();
                    }
                },
                error: function(){
                    console.error('Error loading tumblr posts from server');
                }
            };
        collection.fetch(options);
    },
    toggle_feed: function () {
        var btn = this.$el.find('[data-role="button"]');

        btn.toggleClass('open').toggleClass('closed');
        btn.toggleClass('top-left-arrow');
        this.$el.find('.post-stream').fadeToggle();
    }
});

var dash_stream = side_scroll.extend({

    tagName: 'li',

    className: 'image-stream',

    events: {
        "click .remove-stream": "remove_stream",
        "click a.ui-bar": "toggle_stream"
    },

    post_initialize: function( options ){
        this.template = this.get_template('components/dash/stream');
        this.thumbs_template = this.get_template('components/dash/thumb');
        if (!options.featured){
            this.$el.addClass("user-stream");
            this.$el.attr("data-id", this.model.get("id"));
        }
        if (options.expand) {
            this.toggle_stream();
        }
    },

    toggle_stream: function() {
        var this_view = this,
            btn = this_view.$el.find('[data-role="button"]'),
            options = {
                data: {
                    n: config.get('side_scroll_initial'),
                    detail: 0
                },
                success: function () {
                    this_view.render();
                    btn.attr('data-icon', 'arrow-r');
                    this_view.$el.find('[data-role="button"]').button();
                    this_view.$el.find('.thumbs-grid').fadeToggle();
                }
            };
        if (!this_view.collection.length) {
            var data_query = unescape(btn.attr('data-query'));
            if (data_query != 'undefined') {
                var query = new Query(data_query);
                options.data = $.extend(options.data, query.query);
            }
            this_view.collection.fetch( options );

        }
        else {
            this_view.$el.find('.thumbs-grid').fadeToggle();
            if (btn.attr('data-icon') === 'arrow-r') {
                btn.removeAttr('data-icon');
            } else {
                btn.attr('data-icon', 'arrow-r').button();
            }
            btn.toggleClass('open').toggleClass('closed');
            btn.toggleClass('top-left-arrow');
            this_view.$el.find('[data-role="button"]').button();
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
    }
});

var add_person = page_view.extend({

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
        this.$el.find("ul.people-list").empty();
        this.$el.find(".ui-input-text").val('');

        this.change_page();
    },

    events: {
        "keyup input": "search"
    },

    render: function(){
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

    post_initialize: function(){
        var dialog = this;
        this.$el.live( "pageshow", function( e, ui ){
            dialog.$('#dash-search-keywords').focus();
        });

    },

    post_activate: function(){
        this.$el.find(".ui-input-text").val('');

        this.change_page();

        var dialog = this;
        this.$el.live( "pageshow", function( e, ui ){
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
