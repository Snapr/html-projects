/*global _  define require */
define(['config', 'backbone', 'views/base/view', 'views/components/favorite_button', 'collections/reaction', 'models/comment', 'auth', 'utils/alerts'],
    function(config, Backbone, view, favorite_button, reaction_collection, comment_model, auth, alerts){

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

    load_reactions: function()
    {
        var li_view = this;
        this.reactions.collection.fetch({
            success: function()
            {
                li_view.$('.reactions-button').x_loading(false);
                li_view.show_comment_form();
            }
        });
    },

    render: function()
    {
        var location = this.model.has("location") && this.model.get("location").location,
            city;

        if (location)
        {
            if (location.split(",").length > 1)
            {
                city = location.split(",")[location.split(",").length - 2].replace(/.[0-9]/g, "");
            }
            else
            {
                city = location.split(",")[0].replace(/.[0-9]/g, "");
            }
        }
        else
        {
            city = "";
        }

        this.$el.html(this.template( {
            item: this.model,
            city: city,
            back: this.back
        } ));

        this.fav_button = new favorite_button({
            model: this.model,
            el: this.$el.find(".v-fav-button")[0],
            li: this
        }).render();

        this.comment_button = new comment_button({
            model: this.model,
            el: this.$el.find(".v-comment-button")[0],
            li: this
        }).render();

        this.show_all = new show_all_button({
            model: this.model,
            el: this.$el.find(".v-show-all-button")[0],
            li: this
        }).render();

        this.reactions = new reactions({
            id: this.model.id,
            el: this.$el.find('.reactions-list')[0]
        });

        this.manage = new photo_manage({
            model: this.model,
            el: this.$el.find('.v-photo-manage')[0],
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

    toggle_comment_form: function()
    {
        this.$el.find('.comment-button').toggleClass('selected');
        this.$el.find('.comment-area').toggle();
    },

    show_comment_form: function()
    {
        this.$el.find('.comment-button').addClass('selected');
        this.$el.find('.comment-area').show();
    },

    hide_comment_form: function()
    {
        this.$el.find('.comment-button').removeClass('selected');
        this.$el.find('.comment-area').hide();
    },

    toggle_reactions: function(){
        this.$el.find('.reactions-button').toggleClass('selected');

        if (this.$el.find('.reactions-list:visible').length){
            this.$el.find('.reactions-button .ui-btn-text').text('show');
            this.$el.find('.reactions-list').hide();
            this.hide_comment_form();
        }
        else{
            this.$el.find('.reactions-button .ui-btn-text').text('hide');
            this.$('.reactions-button').x_loading();
            this.load_reactions();
            this.$el.find('.reactions-list').show();
            if (this.$el.find('.reactions-list li').length){
                this.show_comment_form();
            }
        }
    },

    toggle_photo_manage: function()
    {
        this.$el.find('.more-button').toggleClass('selected');
        if (this.$el.find('.v-photo-manage .inline-palette:visible').length)
        {
            this.$el.find('.v-photo-manage').empty();
        }
        else
        {
            this.manage.render();
        }
    },

    show_reactions: function()
    {
        this.$el.find('.reactions-button').addClass('selected');
        this.$el.find('.reactions-list').show();
    },

    goto_map: function()
    {
        Backbone.history.navigate( this.map_url );
    },

    goto_spot: function()
    {
        Backbone.history.navigate( this.spot_url );
    },

    comment: function( e )
    {
        var commentText = this.$el.find('textarea').val();
        var comment = new comment_model();
        comment.data = {
            photo_id: this.model.get('id'),
            comment: commentText
        };
        // make a copies of 'this' to pass to functions in the options object
        var feed_li = this;

        feed_li.$('.comment-form .ui-btn').x_loading();

        var options = {
            success: function( s )
            {
                $.mobile.hidePageLoadingMsg();
                if (s.get('success'))
                {
                    var comment_count = parseInt( feed_li.model.get('comments'), 10 ) + 1;
                    feed_li.model.set({
                        comments: comment_count
                    });
                    feed_li.$el.find('textarea').val('');
                    feed_li.show_reactions();
                    feed_li.load_reactions();
                    feed_li.$('.comment-form .ui-btn').x_loading(false);
                }
            },
            error: function( error )
            {
                $.mobile.hidePageLoadingMsg();
                console.log('error', error);
                feed_li.$('.comment-form .ui-btn').x_loading(false);
            }
        };

        auth.require_login( function()
        {
            $.mobile.showPageLoadingMsg();
            // the empty object in this save call is important,
            // without it, the options object will not be used
            comment.save( {}, options );
        } )();
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
        var selected = this.$el.find( ".selected" ).length > 0;
        this.$el.html( this.template({
            count: parseInt( this.model.get( "comments" ), 10 ),
            selected: selected
        }));

        $(this.li.el).trigger("create");

        return this;
    }

});

var show_all_button = view.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.li = this.options.li;
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.load_template('components/feed/show_all_button');

        // update the display when we fav/unfav or comment
        this.model.bind( "change", this.render );
    },

    render: function()
    {
        var selected = this.$el.find(".selected").length > 0;
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

return feed_li;

});
