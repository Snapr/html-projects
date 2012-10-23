/*global _  define require */
define(
    [
        'backbone',
        'config',
        'auth',
        'utils/photoswipe',
        'utils/alerts',
        'views/base/view',
        'views/base/page',
        'views/components/no_results',
        'views/components/paused',
        'views/upload_progress_li',
        'collections/upload_progress',
        'collections/photo',
        'collections/reaction',
        'models/user',
        'models/comment',
        'models/favorite'
    ],
    function(
        Backbone,
        config,
        auth,
        photoswipe,
        alerts,
        view,
        page_view,
        no_results,
        paused_el,
        upload_progress_li,
        upload_progress,
        photo_collection,
        reaction_collection,
        user_model,
        comment_model,
        favorite_model
    ){

var feed_view =  page_view.extend({

    post_initialize: function(){
        var feed_view = this;
        this.$el.on( "pageshow", function(){
            feed_view.$( ".x-feed-view-toggle input[type='radio']" ).checkboxradio( "refresh" );
            feed_view.watch_uploads();
        });
        this.$el.on( "pagehide", function(){
            feed_view.watch_uploads(false);
            feed_view.$('.x-activity').hide();
        });
        config.on('change:paused', function(){
            if(config.get('paused')){
                feed_view.$(".x-feed-upload-list").prepend(paused_el).trigger("create");
            }else{
                $('.x-resume-queue').remove();
            }
        });
    },

    post_activate: function(options){
        this.more_button(false);

        this.photo_collection = new photo_collection();
        this.photo_collection.url = config.get('api_base') + "/search/";

        this.query = this.options.query || {};

        if (this.query.photo_id){
            this.title = "Back";
        }else if (this.query.username){
            this.title = 'Feed';
        }else if (this.query.keywords){
            this.title = this.feed_parameter;
        }else if (this.query.area){
            this.title = "Location";
        }else if (this.query.favorited_by){
            this.title = "Favorites";
        }else if (this.query.spot && this.query.venue_name){
            this.title = "Spot";
        }else{
            this.title = "Feed";
        }

        var list_style = this.query.list_style || 'list';

        var toggle_container = this.$( ".x-feed-view-toggle" );
        toggle_container.find( "input[type='radio']" ).attr( "checked", false );

        if (list_style == 'grid'){
            this.$(".feed-content").addClass("x-grid");
            toggle_container.find(".x-grid").attr( "checked", true );
        }else{
            this.$(".feed-content").removeClass("x-grid");
            toggle_container.find(".x-list").attr( "checked", true );
        }


        if (this.query.username){
            var this_view = this;
            var user = new user_model( {username: this.query.username} );
            user.on('change', function(){
                this_view.title = user.get('display_username');
            });
            this.feed_header = new user_header({
                username: this.query.username,
                model: user,
                el: this.$(".x-feed-header").empty()[0]
            });
        }else{
            this.feed_header = new feed_header({
                query_data: this.query,
                el: this.$(".x-feed-header").empty()[0]
            });
        }

        this.$el.toggleClass('x-my-snaps', this.is_my_snaps());
        this.$('.x-activity').toggle(this.is_my_snaps());

        this.$el.removeClass("x-showing-upload-queue");
        this.$(".x-feed-upload-list").empty();

        this.$(".x-feed-upload-list").empty();
        this.$('.x-feed-images').empty();

        this.change_page();

        if(this.query.date){
            this.query.date = this.query.date.replace('+', ' ');
        }
        this.photo_collection.data = this.query;
        this.photo_collection.data.n = this.photo_collection.data.n || config.get('feed_count');
        this.photo_collection.data.detail = 2;
        if(this.photo_collection.data.list_style){ delete this.photo_collection.data.list_style; }

        this.populate_feed();
        this.update_uploads();
    },

    events: {
        "click .x-load-more": "more",
        "change .x-feed-view-toggle": "feed_view_toggle"
    },

    is_my_snaps: function(){ return auth.has("snapr_user") && auth.get("snapr_user") == this.options.query.username; },

    get_default_tab: function(){ return this.is_my_snaps() && 'feed' || 'discover'; },

    photoswipe_init: function(){ $( ".x-gallery-link", this.el ).photoswipe_init('feed'); },

    populate_feed: function( additional_data ){

        var list_style = this.$(".x-feed-view-toggle .x-grid").is(":checked") && 'grid' || 'list';

        if (this.feed_list){
            this.feed_list.list_style = list_style;
        }

        var feed_view = this;
        var options = {
            success: function( collection, response ){
                if(collection.length){
                    feed_view.feed_list = new feed_list({
                        el: feed_view.$('.x-feed-images')[0],
                        collection: feed_view.photo_collection,
                        list_style: list_style
                    });
                    feed_view.photo_collection.on('remove', feed_view.photoswipe_init);

                    feed_view.feed_list.render( feed_view.photoswipe_init );
                    $.mobile.hidePageLoadingMsg();
                    feed_view.$( ".x-feed-more" ).show();
                    feed_view.more_button(
                        !feed_view.photo_collection.data.n || (
                            response.response &&
                            response.response.photos &&
                            response.response.photos.length >= feed_view.photo_collection.data.n )
                        );
                }else{
                    feed_view.feed_list = new feed_list({
                        el: feed_view.$('.x-feed-images')[0],
                        collection: feed_view.photo_collection,
                        list_style: list_style
                    });
                    feed_view.feed_list.render();
                    $.mobile.hidePageLoadingMsg();
                }
            },
            error:function(){
                console.log('error');
                $.mobile.hidePageLoadingMsg();
            }
        };

        if (additional_data){
            options.add = true;
            this.photo_collection.data = $.extend(this.photo_collection.data, additional_data);
        }

        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();

        this.photo_collection.fetch( options );
    },

    more_button: function( more_photos ){
        if (more_photos){
            this.$(".x-feed-more").children().show();
        }else{
            this.$(".x-feed-more").children().hide();
        }
    },

    more: function(){
        var data = this.photo_collection.data;

        data.n = config.get('feed_count');
        data.paginate_from = this.photo_collection.last().get('id');

        this.populate_feed( data );
    },

    feed_view_toggle: function(e){
        var input_target = $('#' + e.target.id);
        var list_style = input_target.val();

        var container = input_target.closest( ".x-feed-view-toggle" );
        container.find( "input[type='radio']" ).attr( "checked", false );
        input_target.attr( "checked", true );
        container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        this.$(".x-feed-content").toggleClass("x-grid", list_style != "list").trigger("refresh");
        this.feed_list.list_style = list_style;
        this.feed_list.render( this.photoswipe_init );
    },

    watch_uploads: function(on){
        if(on !== false){
            upload_progress.on('add', this.update_uploads);
            upload_progress.on('complete', this.upload_complete);
        }else{
            upload_progress.off('add', this.update_uploads);
            upload_progress.off('complete', this.upload_complete);
        }
    },

    update_uploads: function(model, changes){
        if (this.is_my_snaps()){

            var upload_li_template = this.get_template('components/feed/upload_progress');

            // reverse models - newest last
            _.each(model && [model] || upload_progress.models.slice().reverse(), function( photo ){
                var li =  new upload_progress_li({
                    template: upload_li_template,
                    photo: photo
                });
                this.$(".x-feed-upload-list").prepend( li.render().el );
            }, this);

            if (upload_progress.models.length){
                this.$el.addClass("x-showing-upload-queue");
            }

            this.$(".x-feed-upload-list").listview().listview("refresh");
        }
    },

    upload_complete: function( model, queue_id ){
        this.$(".x-upload-id-" + model.id).remove();
        // if we are on a feed for the current snapr user
        if (this.is_my_snaps() && !this.options.query.photo_id){
            // remove the date restriction if it is present
            if (this.photo_collection.data.max_date){
                delete this.photo_collection.data.max_date;
            }
            // refresh the feed content
            this.populate_feed();
        }
    }
});

var feed_list = view.extend({

    initialize: function(){
        _.bindAll( this );

        this.collection.bind( "remove", this.render );

        this.setElement( this.options.el );

        this.li_templates = {
            list: this.get_template('components/feed/list_item'),
            grid: this.get_template('components/feed/grid_item')
        };

        this.list_style = this.options.list_style || 'list';

        this.back = this.options.back || "Back";

        this.list_content = [];

    },

    render: function( callback ){
        var scrollY = window.scrollY;
        this.$el.empty();

        if(this.collection.length){
            _.each( this.collection.models, function( item ){
                var li = new feed_li({
                    model: item,
                    template: this.li_templates[ this.list_style ],
                    back: this.back
                });
                this.$el.append( li.render().el );
            }, this);

            if(this.list_style == 'list'){
                this.$("img").each(function(){
                    var $img = $(this);
                    $img.load(function(){
                        $(this).css("height","auto");
                    });
                });
            }
        }else{
            no_results.render('No Photos', 'delete').$el.appendTo(this.$el);
        }

        // create jquery mobile markup, set to listview and refresh

        this.$el.trigger("create");

        // what's this for?
        this.$el.removeClass('thumbs-grid-med');


        if (scrollY){
            window.scrollTo(0, scrollY);
        }

        if (callback && typeof callback == 'function'){
            callback();
        }

        return this;
    }
});

var feed_li =  view.extend({

    tagName: "article",

    className: "feed-li",

    events: {
        // "click .reactions-button": "load_reactions",
        "click .reactions-button": "toggle_reactions",
        "click .comment-button": "toggle_comment_form",
        "click .more-button": "toggle_photo_manage",
        "click .goto-map": "goto_map",
        "click .goto-spot": "goto_spot",
        "submit .comment-form": "comment"
    },

    initialize: function(){
        _.bindAll( this );

        this.model.bind( "change:status", this.render );

        this.template = this.options.template;
        if (this.model.has('location')){
            this.map_url =
                '#/map/?zoom=' + config.get('zoom') +
                '&lat=' + this.model.get('location').latitude +
                '&lng=' + this.model.get('location').longitude +
                '&photo_id=' + this.model.get('id');

            this.spot_url =
                '#/feed/?spot=' + this.model.get('location').spot_id +
                "&venue_name=" + this.model.get('location').foursquare_venue_name;
        }else{
            this.map_url = null;
            this.spot_url = null;
        }
    },

    load_reactions: function(){
        var li_view = this;
        this.reactions.collection.fetch({
            success: function(){
                li_view.$('.reactions-button').x_loading(false);
                li_view.show_comment_form();
            }
        });
    },

    render: function(){
        var location = this.model.has("location") && this.model.get("location").location,
            city;

        if (location){
            if (location.split(",").length > 1){
                city = location.split(",")[location.split(",").length - 2].replace(/.[0-9]/g, "");
            }
            else{
                city = location.split(",")[0].replace(/.[0-9]/g, "");
            }
        }
        else{
            city = "";
        }

        this.$el.html(this.template( {
            item: this.model,
            city: city,
            back: this.back
        } ));

        this.fav_button = new favorite_button({
            model: this.model,
            el: this.$(".v-fav-button")[0],
            li: this
        }).render();

        this.comment_button = new comment_button({
            model: this.model,
            el: this.$(".v-comment-button")[0],
            li: this
        }).render();

        this.show_all = new show_all_button({
            model: this.model,
            el: this.$(".v-show-all-button")[0],
            li: this
        }).render();

        this.reactions = new reactions({
            id: this.model.id,
            el: this.$('.reactions-list')[0]
        });

        this.manage = new photo_manage({
            model: this.model,
            el: this.$('.v-photo-manage')[0],
            parentView: this
        });

        // this.model.bind( "change:favorite", this.reactions.fetch );
        this.model.bind( "change:comments", this.load_reactions );


        this.$el.trigger('create');
        // delegateEvents makes the event bindings in this view work
        // even though it is a subview of feed_list (very important)
        this.delegateEvents();

        return this;
    },

    toggle_comment_form: function(){
        this.$('.comment-button').toggleClass('selected');
        this.$('.comment-area').toggle();
    },

    show_comment_form: function(){
        this.$('.comment-button').addClass('selected');
        this.$('.comment-area').show();
    },

    hide_comment_form: function(){
        this.$('.comment-button').removeClass('selected');
        this.$('.comment-area').hide();
    },

    toggle_reactions: function(){
        this.$('.reactions-button').toggleClass('selected');

        if (this.$('.reactions-list:visible').length){
            this.$('.reactions-button .ui-btn-text').text('show');
            this.$('.reactions-list').hide();
            this.hide_comment_form();
        }
        else{
            this.$('.reactions-button .ui-btn-text').text('hide');
            this.$('.reactions-button').x_loading();
            this.load_reactions();
            this.$('.reactions-list').show();
            if (this.$('.reactions-list li').length){
                this.show_comment_form();
            }
        }
    },

    toggle_photo_manage: function(){
        this.$('.more-button').toggleClass('selected');
        if (this.$('.v-photo-manage .inline-palette:visible').length){
            this.$('.v-photo-manage').empty();
        }
        else{
            this.manage.render();
        }
    },

    show_reactions: function(){
        this.$('.reactions-button').addClass('selected');
        this.$('.reactions-list').show();
    },

    goto_map: function(){
        Backbone.history.navigate( this.map_url );
    },

    goto_spot: function(){
        Backbone.history.navigate( this.spot_url );
    },

    comment: function( e ){
        var commentText = this.$('textarea').val();
        var comment = new comment_model();
        comment.data = {
            photo_id: this.model.get('id'),
            comment: commentText
        };
        // make a copies of 'this' to pass to functions in the options object
        var feed_li = this;

        feed_li.$('.comment-form .ui-btn').x_loading();

        var options = {
            success: function( s ){
                $.mobile.hidePageLoadingMsg();
                if (s.get('success')){
                    var comment_count = parseInt( feed_li.model.get('comments'), 10 ) + 1;
                    feed_li.model.set({
                        comments: comment_count
                    });
                    feed_li.$('textarea').val('');
                    feed_li.show_reactions();
                    feed_li.load_reactions();
                    feed_li.$('.comment-form .ui-btn').x_loading(false);
                }
            },
            error: function( error ){
                $.mobile.hidePageLoadingMsg();
                console.log('error', error);
                feed_li.$('.comment-form .ui-btn').x_loading(false);
            }
        };

        auth.require_login( function(){
            $.mobile.showPageLoadingMsg();
            // the empty object in this save call is important,
            // without it, the options object will not be used
            comment.save( {}, options );
        } )();
    }
});

var favorite_button = view.extend({

    initialize: function(){
        _.bindAll( this );

        this.li = this.options.li;
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.load_template('components/feed/favorite_button');

        // update the display when we fav/unfav or comment
        this.model.bind( "change", this.render );
    },

    events: {
        "click .x-favorite-button": "favorite"
    },

    favorite: function(){
        var fav_btn = this;
        fav_btn.$('.x-favorite-button').x_loading();

        var is_fav = this.model.get('favorite');
        var fav_count = parseInt( this.model.get('favorite_count'), 10 );


        auth.require_login( function(){
            var fav = new favorite_model({
                id: fav_btn.model.get('id')
            });

            if (is_fav){

                fav_btn.model.set({
                    favorite: false,
                    favorite_count: fav_count - 1
                });

                // already saved as a fav so we will remove it
                var options = {
                    success: function( s ){
                        // success is not passed through so we check for error
                        if (!s.get('error')){
                            fav_btn.render();
                        }
                        fav_btn.$('.x-favorite-button').x_loading(false);
                    },
                    error: function(e){
                        console.log('fav error',e);
                        fav_btn.$('.x-favorite-button').x_loading(false);
                    }
                };
                fav.destroy( options );
            }else{
                // save a new fav (empty object is important)
                var options = {
                    success: function(s){
                        if (s.get('success')){
                            fav_btn.model.set({
                                favorite: true,
                                favorite_count: fav_count + 1
                            });
                            fav_btn.render();
                        }
                        fav_btn.$('.x-favorite-button').x_loading(false);
                    },
                    error: function(e){
                        console.log('fav error',e);
                        fav_btn.$('.x-favorite-button').x_loading(false);
                    }
                };
                fav.save( {}, options );
            }
        })();
    },

    render: function(){
        this.$el.html( this.template({
            favorite: this.model.get("favorite"),
            count: parseInt( this.model.get("favorite_count"), 10)
        }));

        this.li.$el.trigger("create");

        return this;
    }

});

var comment_button = view.extend({

    initialize: function(){
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.li = this.options.li;
        this.load_template('components/feed/comment_button');
        _.bindAll( this );

        // update the display when the comment count changes
        this.model.bind( "change:comments", this.render );
    },

    render: function(){
        var selected = this.$( ".selected" ).length > 0;
        this.$el.html( this.template({
            count: parseInt( this.model.get( "comments" ), 10 ),
            selected: selected
        }));

        $(this.li.el).trigger("create");

        return this;
    }
});

var show_all_button = view.extend({

    initialize: function(){
        _.bindAll( this );

        this.li = this.options.li;
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.load_template('components/feed/show_all_button');

        // update the display when we fav/unfav or comment
        this.model.bind( "change", this.render );
    },

    render: function(){
        var selected = this.$(".selected").length > 0;
        this.$el.html( this.template({
            reactions: parseInt( this.model.get("favorite_count"), 10) + parseInt( this.model.get("comments"), 10),
            selected: selected
        }));

        this.li.$el.trigger("create");

        return this;
    }
});

var reactions = view.extend({

    initialize: function(){
        _.bindAll( this );
        $(this.options.el).undelegate();
        this.setElement( this.options.el );

        this.collection = new reaction_collection();
        this.collection.data = {
            photo_id: this.id
        };
        this.collection.bind( "reset", this.render );
        this.collection.bind( "change", this.render );
        this.load_template('components/feed/reaction_item');
    },

    render: function(){
        this.$el.empty();
        _.each( this.collection.models, function( reaction ){
            this.$el.append(this.template({
                reaction: reaction
            }));
        }, this);
        this.$el.trigger('create').listview().listview('refresh');
    }
});

var photo_manage = view.extend({

    initialize: function(){
        _.bindAll( this );
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.parentView = this.options.parentView;
        this.load_template('components/feed/manage_photo');

        // update the display when we change the photo
        this.model.bind( "change:status", this.render );
        this.model.bind( "change:flagged", this.render );
    },

    events: {
        "click .x-image-privacy": "toggle_status",
        "click .x-image-flag": "flag",
        "click .x-image-delete": "delete"
    },

    render: function(){
        this.$el.html( this.template({
            status: this.model.get("status"),
            flagged: this.model.get("flagged"),
            mine: this.model.get("username") == auth.get("snapr_user")
        })).trigger("create");

        return this;
    },

    toggle_status: function(){
        var photo_manage = this,
            current_status = this.model.get('status'),
            status;

        photo_manage.$('.x-image-privacy').x_loading();

        if (current_status == "public"){
            status = "private";
        }
        else if (current_status == "private"){
            status = "public";
        }

        if (status){
            photo_manage.model.change_status( status, {
                success: function( resp ){
                    if (resp.success){
                        photo_manage.model.set({status: status});
                    }else{
                        console.warn("error changing status", resp);
                    }
                    photo_manage.$('.x-image-privacy').x_loading(false);
                },
                error: function( e ){
                    console.warn("error changing status", e);
                    photo_manage.$('.x-image-privacy').x_loading(false);
                }
            });
        }
    },

    flag: function(){
        var photo_manage = this;
        photo_manage.$('.x-image-flag').x_loading();
        auth.require_login( function(){
            alerts.approve({
                'title': 'Flag this image as innapropriate?',
                'yes': 'Flag',
                'no': 'Cancel',
                'yes_callback': function(){
                    photo_manage.model.flag({
                        success: function( resp ){
                            if (resp.success){
                                photo_manage.model.set({flagged: true});
                                alerts.notification("Flagged", "Thanks, a moderator will review this image shortly");
                            }else{
                                console.warn("error flagging photo", resp);
                            }
                            photo_manage.$('.x-image-flag').x_loading(false);
                        },
                        error: function( e ){
                            console.warn("error flagging photo", e);
                            photo_manage.$('.x-image-flag').x_loading(false);
                        }
                    });
                },
                'no_callback': function(){ photo_manage.$('.x-image-flag').x_loading(false); }
            });
        })();
    },

    'delete': function(){
        var photo_manage = this;
        photo_manage.$('.x-image-delete').x_loading();
        auth.require_login( function(){
            alerts.approve({
                'title': 'Are you sure you want to delete this photo?',
                'yes': 'Delete',
                'no': 'Cancel',
                'yes_callback': function(){
                    photo_manage.model['delete']({
                        success: function( resp ){
                            if (resp.success){
                                photo_manage.model.collection.remove( photo_manage.model );

                            }else{
                                console.warn("error deleting photo", resp);
                            }
                            photo_manage.$('.x-image-delete').x_loading(false);
                        },
                        error: function( e ){
                            console.warn("error deleting photo", e);
                            photo_manage.$('.x-image-delete').x_loading(false);
                        }
                    });
                },
                'no_callback': function(){ photo_manage.$('.x-image-delete').x_loading(false); }
            });
        })();
    }
});

var feed_header = view.extend({

    initialize: function(){
        this.query_data = this.options.query_data;

        this.feed_type = null;
        this.feed_parameter = null;
        this.feed_title = this.query_data.feed_title;

        if (this.query_data.keywords){
            this.feed_type = "search";
            this.feed_parameter = this.query_data.keywords;
        }else if (this.query_data.area){
            this.feed_type = "location";
        }else if (this.query_data.favorited_by){
            this.feed_type = "favorites";
            this.feed_parameter = this.query_data.favorited_by;
        }else if (this.query_data.spot && this.query_data.venue_name){
            this.feed_type = "spot";
            this.feed_parameter = this.query_data.venue_name;
        }else{
            this.feed_type = "feed";
        }

        this.load_template('components/feed/header');
        this.render();
    },

    render: function(){

        this.$el.html( this.template( {
            feed_title: this.feed_title,
            feed_type: this.feed_type,
            feed_parameter: this.feed_parameter
        } ));

        return this;
    }
});

var user_header = view.extend({

    initialize: function(){
        _.bindAll( this );
        $(this.options.el).undelegate();
        this.setElement( this.options.el );

        this.load_template('components/feed/user_header');

        this.model.bind( "change:user_id", this.render );
        this.model.bind( "change:relationship", this.render );

        this.model.fetch({
            error: function(e){
                console.log( "error fetching user in user_header", e );
            }
        });
    },

    render: function(){
        this.$el.html( this.template({
            user: this.model,
            auth_username: auth.get( "snapr_user" ),
            logged_in: auth.has( "access_token" )
        }) ).trigger("create");
        return this;
    },

    events: {
        "click .follow": "follow",
        "click .unfollow": "unfollow"
    },

    follow: function(){
        var user_header_view = this;
        user_header_view.$('.follow').x_loading();
        auth.require_login( function(){
            user_header_view.model.follow(function(){
                user_header_view.$('.follow').x_loading(false);
            });
        })();
    },

    unfollow: function(){
        var user_header_view = this;
        user_header_view.$('.unfollow').x_loading();
        auth.require_login( function(){
            user_header_view.model.unfollow(function(){
                user_header_view.$('.unfollow').x_loading(false);
            });
        })();
    }
});

return feed_view;
});
