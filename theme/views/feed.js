/*global _, define, T */
define(
    ['backbone', 'config', 'auth', 'views/base/view', 'utils/alerts', 'utils/analytics', 'utils/history_state', 'utils/local_storage', 'collections/photo', 'models/favorite', 'models/comment', 'utils/geo'],
    function(Backbone, config, auth, view, alerts, analytics, history_state, local_storage, photo_collection, favorite_model, comment_model, geo){

    var photos_view = view.extend({
        // handles tabs and lists, load more

        initialize: function(){  var self = this;

            /*
            options: {
                el: $element,
                tabs: [
                    {
                        title: 'Photos',
                        query: {username: 'username'},
                        list_style: 'list'(dafault) or 'grid',
                    },
                    {
                        title: 'Favs',
                        quert: {favorited_by: 'username'},
                        list_style: 'list'(dafault) or 'grid',
                ],
                show_tabs: bool (default: true if count > 1),  // can hide when there's only one and no title wanted
                photo_templates{
                    list: temaplte object,
                    grid: temaplte object
                }
            }
            */

            if(_.isEmpty(self.options.tabs)){
                console.warn('feed initialised with no queries');
                return;
            }

            self.template = self.get_template('components/feed/base');
            self.photo_templates = self.options.photo_templates || {
                list: self.get_template(self.options.list_item_template || 'components/feed/list_item'),
                grid: self.get_template(self.options.grid_item_template || 'components/feed/grid_item')
            };


            if(self.options.show_tabs === undefined){
                self.options.show_tabs = (self.options.tabs.length > 1);
            }

            self.collections = {};
            _.each(self.options.tabs, function(tab){

                var original_query = _.clone(tab.query);

                var feed = tab.query.feed;
                delete tab.query.feed;

                if(!tab.query.n){
                    tab.query.n = config.get('feed_count');
                }

                self.collections[tab.title] = new photo_collection([], {data: tab.query});
                self.collections[tab.title].list_style = tab.list_style || 'list';
                self.collections[tab.title].original_query = original_query;

                if(feed){
                    self.collections[tab.title].api_path = '/user/feed/';
                }
            });

            self.$el.html(
                self.template({
                    options: self.options,
                    collections: self.collections
                })
            ).enhanceWithin();

            self.$('.x-load-more').hide();  // we hide this here beucase doing so with css will cause it to fe shown again as 'inline' not 'block'

            self.render();

            /* endless scroll
            ****************/

            var doc = $(document),
                window_height = $(window).height(),
                tollerance = 100,
                // Handler
                endless_scroll = function(e){
                    var doc_height = doc.height();
                    // if tall enough to scroll
                    if(doc_height > window_height+tollerance){
                        // if scrolled near bottom
                        if(doc.scrollTop() > doc_height-window_height-tollerance){
                            console.log("endless scroll triggered for", self.cid);
                            self.load_more();
                        }
                    }
                };
            // bind when page shows / remove when it hides
            this.$el.closest('.ui-page').on( "pageshow", function( e, ui ){
                // be extra sure no other endless scroll is still bound
                doc.off('scrollstop.endless');
                // bind
                doc.on('scrollstop.endless', endless_scroll);
            }).on( "pagehide", function( e, ui ){
                doc.off('scrollstop.endless');
            });

            // be extra sure no other endless scroll is still bound
            doc.off('scrollstop.endless');
            // bind now
            doc.on('scrollstop.endless', endless_scroll);
        },

        events:{
            'click .x-tabs': 'change_tab',
            'click .x-load-more': 'load_more'
        },

        render: function( callback ){  var self = this;
            //$.mobile.loading('show');

            var tab = history_state.get('feed_tab', self.options.tabs[0].title),
                collection = self.collections[tab];

            // active the right tab
            self.$('.x-tabs .ui-btn-active').removeClass('ui-btn-active');
            self.$('.x-tabs a[data-title="'+tab+'"]').addClass('ui-btn-active');

            // show the right content
            self.$('.x-photo-content > ul').not(collection.$el).hide();
            collection.$el && collection.$el.show();

            var fetch = function(){
                delete collection.data.paginate_from;
                self.fetching = collection.fetch({
                data: {include_comments: 10, include_favorites: 10},
                success: function(){
                    self.render_collection(collection);
                    if(callback){callback();}
                }
            });
            }

            if(collection.data.location=='current_location'){
                geo.get_location(
                    function( location ){
                        self.$('.x-no-location').hide();
                        collection.data.latitude = location.coords.latitude;
                        collection.data.longitude = location.coords.longitude;
                        fetch();
                    },
                    function( e ){
                        self.$('.x-no-location').show();
                        alerts.notification('Error', 'Please enable location settings');
                        $.mobile.loading('hide');
                        config.get('current_view').show_bg_loader(false);
                        console.error( "get reverse geocode", e );
                    }
                );
            }else{
                fetch();
            }



            return self;
        },

        render_collection: function(collection){  var self = this;

            if(!collection.$el){
                collection.$el = $('<ul>').addClass('x-'+collection.list_style).appendTo(self.$('.x-photo-content'));
            }else{
                // if not "load more" empty old ones
                if(!collection.data.paginate_from){
                    collection.$el.empty();
                }
                // ensure it's not hidden
                collection.$el.show();
            }

            var width = self.$('.x-photo-content').width();
            collection.each(function(photo, index){

                collection.original_query.n = 1;
                collection.original_query.photo_id = photo.get('id');
                if(collection.original_query.list_style){
                    delete collection.original_query.list_style;
                }
                new photo_view({
                    query: collection.original_query,
                    width: width,
                    model: photo,
                    template: self.photo_templates[collection.list_style]
                })
                .render()
                .$el.appendTo(collection.$el)
                .enhanceWithin();

            });

            self.$('.x-load-more').toggle(collection.length !== 0);
            self.$('.x-no-photos').toggle(collection.$el.children().length + collection.length === 0);

            $.mobile.loading('hide');
            config.get('current_view').show_bg_loader(false);
        },

        change_tab: function(event){  var self = this;
            var tab = $(event.target).data('title'),
                collection = self.collections[tab];

            // stop fetching the other tab
            if(self.fetching){
                self.fetching.abort();
            }

            if(collection.length){
                config.get('current_view').show_bg_loader();
            }else{
                $.mobile.loading('show');
            }

            self.$('.x-load-more, .x-end, .x-no-photos, .x-no-location').hide();

            // remember what tab is active
            history_state.set('feed_tab', tab);

            // switch content
            self.$('.x-photo-content > ul').not(collection.$el).hide();
            collection.$el && collection.$el.show();

            self.fetching = collection.fetch({
                data: {include_comments: 10, include_favorites: 10},
                success: function(){
                    self.render_collection(collection);
                }
            });
        },

        load_more: function(){  var self = this;
            // prevent multiple triggers
            if(self.loading_more){ return; }
            self.loading_more = true;

            var tab = self.$('.x-tabs').find('.ui-btn-active').data('title');
            if(!tab){
                tab = self.options.tabs[0].title;
            }
            var collection = self.collections[tab];

            // prevent trigger after end
            if(collection.end){ return; }

            self.$('.x-end').hide();


            this.$('.x-load-more').x_loading();

            collection.fetch_older({
                success: function(){
                    self.render_collection(collection);
                    if(collection.length === 0){
                        collection.end = true;
                        self.$('.x-end').show();
                    }
                    self.loading_more = false;
                    this.$('.x-load-more').x_loading(false);
                }
            });
        }
    });

    var photo_view = view.extend({
        // handles each photo and it's actions like 'comment'

        tagName: "li",
        className: "s-feed-photo",

        initialize: function(){

            this.model.bind( "change:status", this.render );

            this.template = this.options.template;

            if (this.model.has('location')){
                this.map_url =
                    '#/map/?zoom=' + config.get('zoom') +
                    '&lat=' + this.model.get('location').latitude +
                    '&lng=' + this.model.get('location').longitude +
                    '&photo_id=' + this.model.get('id');

                this.spot_url =
                    '#/spot/?spot_id=' + this.model.get('location').spot_id;
            }else{
                this.map_url = null;
                this.spot_url = null;
            }
        },

        events: {
            "click .x-comment-button": "show_comment_form",
            "click .x-share-button": "show_share_menu",
            "click .x-more-button": "show_more_menu",

            "click .x-show-favorites": "show_favorites",
            "click .x-show-comments": "show_comments",

            "click .x-goto-map": "goto_map",
            "click .x-goto-spot": "goto_spot",

            "click .x-favorite": "toggle_favorite",
            "dblclick .x-photo": "favorite"
        },

        render: function(sections){

            var context = {
                query: this.options.query,
                height: this.options.width / (this.model.get('width') / this.model.get('height')),
                item: this.model,
                city: this.get_city(),
                share_settings: local_storage.get('feed_share_settings') || {}
            };

            if(sections){
                return this.replace_from_template(context, sections);
            }

            this.$el.html(this.template(context));

            this.$('.x-photo').on('load', function(){
                $(this).css('height', 'auto');
            });


            // latch onto these popups now. enhanceWithin is about to move them out of this.$el
            this.reactions_popup = this.$('.x-reactions');

            this.more_menu = this.$('.x-more-menu');
            this.more_menu.on('click', '.x-flag', _.bind(this.flag, this));
            this.more_menu.on('click', '.x-delete', _.bind(this.delete_photo, this));
            this.more_menu.on('click', '.aj-take', _.bind(this.set_taken, this));
            this.more_menu.on('click', '.aj-untake', _.bind(this.set_untaken, this));

            this.share_menu = this.$('.x-share-menu');
            this.share_menu.on('change', '.x-service-select', this.store_share_settings);
            this.share_menu.on('click', '.x-submit-button', _.bind(this.share, this));

            this.comment_form = this.$('.x-comment-form');
            this.comment_form.on('click', '.x-submit-button', _.bind(this.comment, this));

            // delegateEvents makes the event bindings in this view work
            // even though it is a subview of feed_list (very important)
            this.delegateEvents();

            if(this.is_taken_by_user()) {
                this.$('.aj-take').hide();
            }else {
                this.$('.aj-untake').hide();
            }

            return this;
        },

        get_city: function(){

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

            return city;
        },

        show_comments: function(){  var self = this;
            self.show_reactions('comments');
        },
        show_favorites: function(){  var self = this;
            self.show_reactions('favorites');
        },
        show_reactions: function(type){  var self = this;
            $.mobile.loading('show');
            self.model.fetch({success: function(model){
                var popup = new reactions({type:type, model:model, el:self.reactions_popup});
                popup.render();
                self.reactions_popup.popup('open');
                $.mobile.loading('hide');
            }});
        },

        show_more_menu: function(){  var self = this;
            // timeout to allow time for jQm to do it's thing first
            setTimeout(function(){
                self.more_menu.data('mobilePopup')._ui.screen.css('z-index', 900);
                self.more_menu.parent().css('z-index', 901);
            }, 100);
        },

        show_comment_form: function(){  var self = this;
            auth.require_login( function(){
                self.comment_form.toggle();
                self.share_menu.hide();
            })();
        },

        show_share_menu: function(){  var self = this;
            auth.require_login( function(){
                self.share_menu.find('form').show();
                self.share_menu.find('.x-success').hide();
                self.share_menu.toggle();
                self.comment_form.hide();
            })();
        },

        store_share_settings: function(event){
            var button = $(event.currentTarget);
            var service = button.attr('name');
            var checked = button.is(':checked');

            var settings = local_storage.get('feed_share_settings') || {};
            settings[service] = checked;
            local_storage.set('feed_share_settings', settings);

            $('.x-service-select[name='+service+']').attr('checked', checked).checkboxradio("refresh");
        },

        share: function(){  var self = this;

            auth.require_login( function(){

                // check at least one service is selected
                var on = false,
                share_settings = local_storage.get('feed_share_settings') || {};
                _.each(share_settings, function(state, x){
                    on = on || state;
                });
                if(!on){
                    alerts.notification('Oops', 'Please select the services you want to share to');
                    return;
                }

                self.share_menu.find('form').hide();
                self.share_menu.find('.x-success').show();

                setTimeout(function(){
                    self.share_menu.hide();
                }, 2000);

                var message = self.$('.x-share-menu textarea').val(),
                    photo_id = self.model.get('id');

                self.$('.x-share-menu textarea').val('');

                $.ajax({
                    url: config.get('api_base') + '/photo/share/',
                    data: _.extend({}, share_settings, {
                        access_token: auth.get('access_token'),
                        _method: 'POST',
                        message: message,
                        id: photo_id
                    }),
                    dataType: 'jsonp',
                    success: function(response){
                        if(response.success){
                            var share_count = parseInt( self.model.get('share_count'), 10 ),
                                failed = [];

                            _.each(response.response, function(result, service){
                                if(result.success){
                                    share_count++;
                                }else{
                                    if(result.error.type.substr(-10) == 'no_account'){
                                        failed.push(service);
                                    }else{
                                        console.error(result.error);
                                        // another error
                                    }
                                }
                            });

                            if(failed.length){
                                window.location.href = '#/connect/?' + $.param({
                                    to_link: failed.join(','),
                                    photo_id: photo_id,
                                    message: message,
                                    instagram: share_settings.instagram
                                });
                            }else{
                                if(share_settings.instagram){
                                    if(local_storage.get('appmode')){
                                        native_bridge.pass_data("snapr://instagram/share?description=" + message+config.get('instagram_message'));
                                    }
                                }
                            }

                            self.model.set({
                                share_count: share_count
                            });
                        }else{
                             console.error(response.error);
                        }
                    },
                    error: function(e){
                        console.error( 'share error', e );
                    }
                });
            } )();
        },

        goto_map: function(){
            if(config.get('map_enabled')){
                window.location.hash = this.map_url;
            }
        },

        goto_spot: function(){
            window.location.hash = this.spot_url;
        },

        comment: function( e ){  var self = this;

            auth.require_login( function(){

                var comment = new comment_model();
                comment.data = {
                    photo_id: self.model.get('id'),
                    comment: self.comment_form.find('textarea').val(),
                    user: auth.get('snapr_user')
                };

                var comment_count = parseInt( self.model.get('comments'), 10 ) + 1,
                    latest_comments = self.model.get('latest_comments');
                latest_comments.push(comment.data);

                self.model.set({
                    comments: comment_count,
                    latest_comments: latest_comments
                });

                self.comment_form.hide();
                self.comment_form.find('textarea').val("");

                self.render(['.x-comments']).enhanceWithin();

                // the empty object in this save call is important,
                // without it, the options object will not be used
                comment.save( {}, {
                    success: function( s ){
                        if (s.get('success')){
                            analytics.trigger('comment');
                        }else{
                            self.$('.x-comments').children().last().remove();
                        }
                    },
                    error: function( error ){
                        console.log('error', error);
                        self.$('.x-comments').children().last().remove();
                    }
                } );
            } )();
        },

        favorite: function(){
            // only take action if not already a fav
            if(!this.model.get('favorite')){
                this.toggle_favorite();
            }else{
                // otherwise just show the heart
                this.show_favorite_overlay();
            }
        },

        toggle_favorite: function(){  var self = this;
            var button = self.$('.x-favorite');
            var is_fav = this.model.get('favorite'),
                fav_count = parseInt( this.model.get('favorite_count'), 10 ),
                latest_favorites = self.model.get('latest_favorites');


            auth.require_login( function(){
                var fav = new favorite_model({
                    id: self.model.get('id'),
                    user: auth.get('snapr_user')
                });

                function visually_remove_fav(){
                    latest_favorites = _.reject(latest_favorites, function(f){ return f.user == fav.get('user'); });

                    self.model.set({
                        favorite: false,
                        favorite_count: fav_count - 1,
                        latest_favorites: latest_favorites
                    });

                    self.render(['.x-favorites', '.x-action-buttons']).enhanceWithin();
                }
                function visually_add_fav(){

                    latest_favorites.push(fav.attributes);

                    self.model.set({
                        favorite: true,
                        favorite_count: fav_count + 1,
                        latest_favorites: latest_favorites
                    });
                    self.render(['.x-favorites', '.x-action-buttons']).enhanceWithin();
                }

                if (is_fav){

                    // already saved as a fav so we will remove it
                    visually_remove_fav();

                    var options = {
                        success: function( s ){
                            // success is not passed through so we check for error
                            if (s.get('error')){
                                visually_add_fav();
                            }
                        },
                        error: function(e){
                            console.log('fav error',e);
                            visually_add_fav();
                        }
                    };
                    fav.destroy( options );
                }else{

                    self.show_favorite_overlay();
                    visually_add_fav();

                    // save a new fav (empty object is important)
                    fav.save( {}, {
                        success: function(s){
                            if (s.get('success')){
                                analytics.trigger('favorite');
                            }else{
                                visually_remove_fav();
                            }
                        },
                        error: function(e){
                            console.log('fav error',e);
                            visually_remove_fav();
                        }
                    } );
                }
            })();
        },

        show_favorite_overlay: function(){  var self = this;
            var overlay = self.$('.x-favorited-overlay');
            overlay.show();
            setTimeout(function(){
                overlay.fadeOut(1000);
            }, 1000);
        },

        flag: function(){  var self = this;
            self.more_menu.find('.x-photo-flag').x_loading();
            auth.require_login( function(){
                alerts.approve({
                    'title': T('Flag this image as inappropriate'),
                    'yes': T('Flag'),
                    'no': T('Cancel'),
                    'yes_callback': function(){
                        self.model.flag({
                            success: function( resp ){
                                if (resp.success){
                                    if(resp.response.removed){
                                        alerts.notification(T("Removed"), T("The photo has been removed from the app"));
                                        self.model.collection.remove( self.model );
                                    }else if(resp.response.moderated){
                                        alerts.notification(T("Moderated"), T("The photo has been moderated"));
                                        self.$el.hide();
                                        self.model.collection.remove( self.model );
                                    }else if(resp.response.flagged){
                                        self.model.set({flagged: true});
                                        alerts.notification(T("Flagged"), T("The photo has been flagged and a moderater will review it shortly"));
                                    }
                                }else{
                                    console.warn("error flagging photo", resp);
                                }
                                self.more_menu.popup('close');
                                self.more_menu.find('.x-photo-flag').x_loading(false);
                            },
                            error: function( e ){
                                console.warn("error flagging photo", e);
                                self.more_menu.popup('close');
                                self.more_menu.find('.x-photo-flag').x_loading(false);
                            }
                        });
                    },
                    'no_callback': function(){ self.more_menu.find('.x-photo-flag').x_loading(false); }
                });
            })();
        },

        delete_photo: function(){  var self = this;
            self.more_menu.find('.x-photo-delete').x_loading();
            auth.require_login( function(){
                alerts.approve({
                    'title': T('Are you sure you want to delete this photo'),
                    'yes': T('Delete'),
                    'no': T('Cancel'),
                    'yes_callback': function(){
                        self.model.delete_photo({
                            success: function( resp ){
                                console.log('model.delete response', resp);
                                if (resp.success){
                                    console.log('hide');
                                    self.$el.hide();
                                    console.log('remove');
                                    self.model.collection.remove( self.model );
                                    console.log('done');
                                }else{
                                    console.warn("error deleting photo", resp);
                                }
                                console.log('close menu');
                                self.more_menu.popup('close');
                                console.log('hide loader');
                                self.more_menu.find('.x-photo-delete').x_loading(false);
                            },
                            error: function( e ){
                                console.warn("ajax error deleting photo", e);
                                self.more_menu.popup('close');
                                self.more_menu.find('.x-photo-delete').x_loading(false);
                            }
                        });
                    },
                    'no_callback': function(){ self.more_menu.find('.x-photo-delete').x_loading(false); }
                });
            })();
        },

        //TAKE AND UNTAKE FUNCTIONALITY
        takenTag : "#taken",

        set_taken : function(ev){ var self = this;
            var r = confirm("Report this item #taken?");
            if (r===true) {
                if(!this.is_taken_by_user()) {
                    var commentArea = self.$('.s-comment-area');
                    $(commentArea).find('textarea').val('reports this junk as ' + self.takenTag);
                    this.commentTaken();
                }
                else {
                    alert("You've already reported this #taken");
                }

                //switch buttons
                self.more_menu.find('.aj-take').hide();
                self.more_menu.find('.aj-untake').show();
            }
        },

        commentTaken: function( e ){  var self = this;

            auth.require_login( function(){

                var comment = new comment_model();
                comment.data = {
                    photo_id: self.model.get('id'),
                    comment: self.comment_form.find('textarea').val(),
                    user: auth.get('snapr_user')
                };

                var comment_count = parseInt( self.model.get('comments'), 10 ) + 1;
                latest_comments = self.model.get('latest_comments');
                latest_comments.push(comment.data);

                self.model.set({
                    comments: comment_count,
                    latest_comments: latest_comments
                });

                self.comment_form.hide();
                self.comment_form.find('textarea').val("");

                self.render(['.x-comments']).enhanceWithin();

                // the empty object in this save call is important,
                // without it, the options object will not be used
                comment.save( {}, {
                    success: function( s ){
                        if (s.get('success')){
                            analytics.trigger('comment');
                            //to save comment id for visual feedback if take-untake
                            var latestComments = self.model.get('latest_comments');
                            var lastComment = latestComments[latestComments.length - 1];
                            lastComment.id = s.get('response').comment.id;
                            latestComments.pop();
                            latestComments.push(lastComment);
                            self.model.set({
                                latest_comments: latest_comments
                            });

                        }else{
                            self.$('.x-comments').children().last().remove();
                        }
                    },
                    error: function( error ){
                        console.log('error', error);
                        self.$('.x-comments').children().last().remove();
                        self.$('.takenText').hide();
                        self.$('.s-image-area').fadeTo("slow", 1);
                    }
                } );
            } )();
        },

        set_untaken : function(){ var self = this;
            var r = confirm("Report this junk NOT taken?");
            if (r===true) {
                var commentToDelete = this.get_comment_id(this.takenTag);
                if (commentToDelete !== 0) {
                        this.delete_comment(commentToDelete);
                        self.$('.s-image-area').fadeTo("slow", 1);
                        if(this.is_taken() === true) {
                            console.log('this item remains tagged #taken by another user');
                        }
                    }
                else {
                    alert("You haven't reported this junk as #taken");
                }
                //switch buttons
                self.more_menu.find('.aj-take').show();
                self.more_menu.find('.aj-untake').hide();
            }
        },

        get_comment_id: function(commentContent) {var self=this;
            var match = 0;
            var latestComments = this.model.get('latest_comments');
             if (this.model.get('comments') > 0) {
                _.each(latestComments, function (c) {
                    if(c.user === auth.get('snapr_user') && c.comment.indexOf(commentContent) != -1){
                        match = c.id;
                        return match;
                    }
                });
            }
            return match;
        },

        'delete_comment': function( commentId ){var self=this;

            //visually speaking
            var numComments = self.model.get("comments");
            var latestComments = self.model.get("latest_comments");
            updatedLatestComments = _.reject(latestComments, function(c){ return c.id === commentId; });
            self.model.set({
                comments: numComments - 1,
                latest_comments : updatedLatestComments
            });
            self.render(['.x-comments']).enhanceWithin();
            
            //server
            var ajax_options = {};
            ajax_options =  {
                url: config.get('api_base') + "/comment/delete/",
                dataType: "jsonp",
                data: _.extend({}, auth.attributes, {
                    id: commentId,
                    _method: "POST"
                }),
                error: function(error){
                    //remove front-end visual feedback
                    console.log('error', error);
                    self.model.set({
                        comments: numComments,
                        latest_comments : latestComments
                    });
                    self.render(['.x-comments']).enhanceWithin();
                    self.$('.takenText').show();
                }

            };
            $.ajax( ajax_options );

        },

        is_taken_by_user: function(){var self=this;
            return(self.is_tagged_by_user(self.takenTag));
        },

        is_taken: function(){var self=this;
            return(self.is_tagged(self.takenTag));
        },

        is_author: function() {var self=this;
            if (self.model.get('username') === auth.get('snapr_user')) {
                return true;
            }
            return false;
        },

        is_tagged: function(tag){var self=this;
            var tagged=false;
            if (this.model.get('comments') > 0) {
                _.each(this.model.get('latest_comments'), function(commentObj){
                    if (commentObj.comment.indexOf(tag) != -1) {
                        tagged = true;
                        return tagged;
                    }
                });
            }
            return tagged;
        },

        is_tagged_by_user: function(tag){var self=this;
            var tagged=false;
            if (this.model.get('comments') > 0) {
                _.each(this.model.get('latest_comments'), function(commentObj){
                    if (commentObj.user === auth.get('snapr_user') && commentObj.comment.indexOf(tag) != -1) {
                        tagged = true;
                        return tagged;
                    }
                });
            }
            return tagged;
        }
    });

    var reactions = view.extend({
        initialize: function(options){  var self = this;
            self.type = self.options.type;
            self.template = self.get_template('components/feed/reactions_popup');
        },
        render: function(){  var self = this;
            console.log(this.$el);
            self.replace_from_template({item: self.model, type: self.type}, ['.x-header', '.x-list']).enhanceWithin();
            self.$('.x-list').listview('refresh');
        }

        // events: {
        //     'click a': 'close'
        // },


        // close: function(){
        //     this.$el.panel('close');
        // }
    });

    return photos_view;
});
