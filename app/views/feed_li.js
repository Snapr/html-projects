snapr.views.feed_li = Backbone.View.extend({

    tagName: "span",

    className: "feed-li",

    events: {
        "expand .reactions-button": "load_reactions",
        "click .favorite-button": "favorite",
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
    },

    load_reactions: function( reload )
    {
        if (!this.reactions || reload)
        {
            this.reactions = new snapr.views.reactions({
                id:this.model.id,
                el:$(this.el).find('ul')
            });
        }
        else
        {
            console.warn('reactions already loaded');
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

        $(this.el).trigger('create');
        // delegateEvents makes the event bindings in this view work
        // even though it is a subview of feed_list (very important)
        this.delegateEvents();

        return this;
    },

    update_fav: function()
    {
        if (this.model.get('favorite'))
        {
            $(this.el).find('.favorite-button').addClass('ui-btn-up-e').removeClass('ui-btn-up-c');
        }
        else
        {
            $(this.el).find('.favorite-button').addClass('ui-btn-up-c').removeClass('ui-btn-up-e');
        }
        // if we have already loaded reactions, re-load them
        if (this.reactions)
        {
            this.load_reactions( true );
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
                    success: function(s)
                    {
                        // success is not passed through so we check for error
                        if (!s.get('error'))
                        {
                            feed_li.model.set({
                                favorite: false,
                                favorite_count: fav_count - 1
                            });
                            feed_li.update_fav();
                            feed_li.update_counts();
                        }
                    },
                    error: function(e)
                    {
                        console.warn('fav error',e);
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
                        console.warn('notfav success')
                        if (s.get('success'))
                        {
                            feed_li.model.set({
                                favorite: true,
                                favorite_count: fav_count + 1
                            });
                            feed_li.update_fav();
                            feed_li.update_counts();
                        }
                        console.warn('fav success',s);
                    },
                    error: function(e)
                    {
                        console.warn('fav error',e);
                    }
                }
                fav.save( {}, options );
            }
        })();
    },

    update_counts: function()
    {
        // change the button text for the reactions button
        $(this.el).find('.reactions-button h3 .ui-btn-text')
            .text( this.model.get('comments') +
                ' comments and ' +
                this.model.get('favorite_count') +
                ' favorites' );
        // show the button if it was previously hidden and create the jquery mobile markup
        if (parseInt( this.model.get('comments') ) + parseInt( this.model.get('favorite_count') ) > 0)
        {
            $(this.el).find('.reactions-button').show().trigger('create');
        }
        else
        {
            $(this.el).find('.reactions-button').hide();
        }
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
                    console.warn('save comment success');
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
                                // console.warn('fetch reactions success',s);
                                comment_area.find('.comment-form textarea').val('');
                                comment_area.trigger('collapse');
                                // console.warn('render reactions');
                                feed_li.reactions.render();
                            },
                            error: function( e )
                            {
                                console.warn('error', e);
                            }
                        });
                    }
                }
            },
            error: function( error )
            {
                console.warn('error', error);
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