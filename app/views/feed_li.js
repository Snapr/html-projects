define(['backbone'], function(Backbone){
return Backbone.View.extend({

    tagName: "span",

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

    initialize: function()
    {
        _.bindAll( this );

        this.model.bind( "change:status", this.render );

        this.back = this.options.back || "Back";

        this.template = this.options.template;
        if (this.model.has('location'))
        {
            this.map_url =
                '#/map/?zoom=' + snapr.constants.default_zoom +
                '&lat=' + this.model.get('location').latitude +
                '&lng=' + this.model.get('location').longitude +
                '&photo_id=' + this.model.get('id') +
                '&back=' + this.back;

            this.spot_url =
                '#/feed/?spot=' + this.model.get('location').spot_id +
                "&venue_name=" + this.model.get('location').foursquare_venue_name +
                '&back=' + this.back;
        }
        else
        {
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

        this.fav_button = new snapr.views.favorite_button({
            model: this.model,
            el: this.$el.find(".v-fav-button")[0],
            li: this
        }).render();

        this.comment_button = new snapr.views.comment_button({
            model: this.model,
            el: this.$el.find(".v-comment-button")[0],
            li: this
        }).render();

        this.show_all = new snapr.views.feed_li_show_all_button({
            model: this.model,
            el: this.$el.find(".v-show-all-button")[0],
            li: this
        }).render();

        this.reactions = new snapr.views.reactions({
            id: this.model.id,
            el: this.$el.find('.reactions-list')[0]
        });

        this.manage = new snapr.views.photo_manage({
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

    toggle_reactions: function()
    {
        this.$el.find('.reactions-button').toggleClass('selected');

        if (this.$el.find('.reactions-list:visible').length)
        {
            this.$el.find('.reactions-list').hide();
            this.hide_comment_form();
        }
        else
        {
            this.$('.reactions-button').x_loading();
            this.load_reactions();
            this.$el.find('.reactions-list').show();
            if (this.$el.find('.reactions-list li').length)
            {
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
        Route.navigate( this.map_url );
    },

    goto_spot: function()
    {
        Route.navigate( this.spot_url );
    },

    comment: function( e )
    {
        var commentText = this.$el.find('textarea').val();
        var comment = new snapr.models.comment();
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
                if (s.get('success'))
                {
                    var comment_count = parseInt( feed_li.model.get('comments') ) + 1;
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
                console.log('error', error);
                feed_li.$('.comment-form .ui-btn').x_loading(false);
            }
        };

        snapr.utils.require_login( function()
        {
            // the empty object in this save call is important,
            // without it, the options object will not be used
            comment.save( {}, options );
        } )();
    }
});
});
