snapr.views.feed_li = Backbone.View.extend({

    tagName: "span",

    className: "feed-li",

    events: {
        //"click .reactions-button": "load_reactions",
        "click .reactions-button": "toggle_reactions",
        "click .favorite-button": "favorite",
        "click .comment-button": "toggle_comment_form",
        "click .goto-map": "goto_map",
        "click .goto-spot": "goto_spot",
        "submit .comment-form": "comment"
    },

    initialize: function()
    {
        this.template = this.options.template
        this.map_url =
            '/map/?zoom=' + snapr.constants.default_zoom +
            '&lat=' + this.model.get('location').latitude +
            '&lng=' + this.model.get('location').longitude +
            '&photo_id=' + this.model.get('id');
        this.spot_url =
            '/feed/?spot=' + this.model.get('location').spot_id;

        // update the display when we fav/unfav or comment
        this.model.bind( "set", this.render );
    },

    load_reactions: function( reload )
    {
        if (!this.reactions || reload)
        {
            this.reactions = new snapr.views.reactions({
                id:this.model.id,
                el:$(this.el).find('.reactions-list')
            });
        }
        else
        {
            console.log('reactions already loaded');
        }
    },

    render: function()
    {
        var location = this.model.get("location") && this.model.get("location").location;

        if (location)
        {
            if (location.split(",").length > 1)
            {
                var city = location.split(",")[location.split(",").length - 2].replace(/.[0-9]/g, "");
            }
            else
            {
                var city = location.split(",")[0].replace(/.[0-9]/g, "");
            }
        }
        else
        {
            var city = ""
        }

        $(this.el).html(this.template( {
            item: this.model,
            city: city
        } ));

        $img = $(this.el).find("img");
        $img.load(function(){
            $img.css("height","auto");
        });

        $(this.el).trigger('create');
        // delegateEvents makes the event bindings in this view work
        // even though it is a subview of feed_list (very important)
        this.delegateEvents();

        return this;
    },

    toggle_comment_form: function()
    {
        $(this.el).find('.comment-button').toggleClass('selected');
        $(this.el).find('.comment-area').toggle();
    },

    show_comment_form: function()
    {
        $(this.el).find('.comment-button').addClass('selected');
        $(this.el).find('.comment-area').show();
    },

    hide_comment_form: function()
    {
        $(this.el).find('.comment-button').removeClass('selected');
        $(this.el).find('.comment-area').hide();
    },

    toggle_reactions: function()
    {
        if ($(this.el).find('.reactions-list:visible').length)
        {
            this.hide_comment_form();
        }
        else
        {
            this.show_comment_form();
        }
        $(this.el).find('.reactions-button').toggleClass('selected');
        $(this.el).find('.reactions-list').toggle();

        if (!this.reactions)
        {
            this.load_reactions( false );
        }
    },

    goto_map: function()
    {
        Route.navigate( this.map_url, true );
    },

    goto_spot: function()
    {
        Route.navigate( this.spot_url, true );
    },


    favorite: function()
    {
        var feed_li = this;
        var is_fav = this.model.get('favorite');
        var fav_count = parseInt( this.model.get('favorite_count') );

        snapr.utils.require_login( function()
        {
            var fav = new snapr.models.favorite({
                id: feed_li.model.get('id')
            });

            if (is_fav)
            {
                // already saved as a fav so we will remove it
                var options = {
                    success: function( s )
                    {
                        // success is not passed through so we check for error
                        if (!s.get('error'))
                        {
                            feed_li.model.set({
                                favorite: false,
                                favorite_count: fav_count - 1
                            });
                            feed_li.render();
                        }
                    },
                    error: function(e)
                    {
                        console.log('fav error',e);
                    }
                }
                fav.destroy( options );
            }
            else
            {
                // save a new fav (empty object is important)
                var options = {
                    success: function(s)
                    {
                        if (s.get('success'))
                        {
                            feed_li.model.set({
                                favorite: true,
                                favorite_count: fav_count + 1
                            });
                            feed_li.render();
                        }
                    },
                    error: function(e)
                    {
                        console.log('fav error',e);
                    }
                }
                fav.save( {}, options );
            }
        })();
    },

    comment: function()
    {
        var comment = $(this.el).find('.comment-form textarea').val();
        var id = this.model.get('id');
        var c = new snapr.models.comment();
        c.data = {
            id: id,
            comment: comment
        }
        // make a copies of 'this' and the .comment-area to pass to functions in the options object
        var feed_li = this;
        var comment_area = $(this.el).find('.comment-area').eq(0);

        var options = {
            success: function( s )
            {
                if (s.get('success'))
                {
                    console.log('save comment success');
                    var comment_count = parseInt( feed_li.model.get('comments') ) + 1;
                    feed_li.model.set({
                        comments: comment_count
                    });
                    if (!feed_li.reactions)
                    {
                        comment_area.find('.comment-form textarea').val('');
                        comment_area.trigger('collapse');
                        $(feed_li.el).find('.reactions-button').trigger('expand');
                    }
                    else
                    {
                        feed_li.reactions.reaction_collection.fetch({
                            success: function( s )
                            {
                                // console.log('fetch reactions success',s);
                                comment_area.find('.comment-form textarea').val('');
                                comment_area.trigger('collapse');
                                // console.log('render reactions');
                                feed_li.reactions.render();
                            },
                            error: function( e )
                            {
                                console.log('error', e);
                            }
                        });
                    }
                }
            },
            error: function( error )
            {
                console.log('error', error);
            }
        }

        snapr.utils.require_login( function()
        {
            // the empty object in this save call is important,
            // without it, the options object will not be used
            c.save( {}, options );
        } )();
    }
});
