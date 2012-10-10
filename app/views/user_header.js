/*global _  define require */
define(['views/base/view', 'auth'], function(view, auth){
return view.extend({

    initialize: function()
    {
        _.bindAll( this );
        $(this.options.el).undelegate();
        this.setElement( this.options.el );

        this.load_template('components/feed/user_header');

        this.model.bind( "change:user_id", this.render );
        this.model.bind( "change:relationship", this.render );

        this.model.fetch({
            error: function(e)
            {
                console.log( "error fetching user in user_header", e );
            }
        });
    },

    render: function()
    {
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

    follow: function()
    {
        var user_header_view = this;
        user_header_view.$('.follow').x_loading();
        auth.require_login( function(){
            user_header_view.model.follow(function(){
                user_header_view.$('.follow').x_loading(false);
            });
        })();
    },

    unfollow: function()
    {
        var user_header_view = this;
        user_header_view.$('.unfollow').x_loading();
        auth.require_login( function(){
            user_header_view.model.unfollow(function(){
                user_header_view.$('.unfollow').x_loading(false);
            });
        })();
    }

});
});
