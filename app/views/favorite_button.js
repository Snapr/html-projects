define(['backbone'], function(Backbone){
return Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.li = this.options.li;
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.template = _.template( $("#fav-button-template").html() );

        // update the display when we fav/unfav or comment
        this.model.bind( "change", this.render );
    },

    events: {
        "click .favorite-button": "favorite"
    },

    favorite: function()
    {
        var fav_btn = this;
        var is_fav = this.model.get('favorite');
        var fav_count = parseInt( this.model.get('favorite_count') );

        window.f = fav_btn;
        fav_btn.$('.favorite-button').x_loading();

        snapr.utils.require_login( function()
        {
            var fav = new snapr.models.favorite({
                id: fav_btn.model.get('id')
            });

            if (is_fav)
            {

                fav_btn.model.set({
                    favorite: false,
                    favorite_count: fav_count - 1
                });

                // already saved as a fav so we will remove it
                var options = {
                    success: function( s )
                    {
                        // success is not passed through so we check for error
                        if (!s.get('error'))
                        {
                            fav_btn.render();
                        }
                        fav_btn.$('.favorite-button').x_loading(false);
                    },
                    error: function(e)
                    {
                        console.log('fav error',e);
                        fav_btn.$('.favorite-button').x_loading(false);
                    }
                };
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
                            fav_btn.model.set({
                                favorite: true,
                                favorite_count: fav_count + 1
                            });
                            fav_btn.render();
                        }
                        fav_btn.$('.favorite-button').x_loading(false);
                    },
                    error: function(e)
                    {
                        console.log('fav error',e);
                        fav_btn.$('.favorite-button').x_loading(false);
                    }
                }
                fav.save( {}, options );
            }
        })();
    },

    render: function()
    {
        this.$el.html( this.template({
            favorite: this.model.get("favorite"),
            count: parseInt( this.model.get("favorite_count"))
        }));

        this.li.$el.trigger("create");

        return this
    }

});

});
