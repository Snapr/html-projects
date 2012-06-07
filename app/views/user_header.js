/*global _ Route define require */
define(['backbone', 'auth'], function(Backbone, auth){
return Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.template = _.template( $("#user-header-template").html() );

        this.model.bind( "change:user_id", this.render );
        this.model.bind( "change:relationship", this.render );

        this.model.fetch({
            error: function()
            {
                console.log( "error fetching user in user_header" );
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
        snapr.utils.require_login( function(){
            user_header_view.model.follow(function(){
                user_header_view.$('.follow').x_loading(false);
            });
        })();
    },

    unfollow: function()
    {
        var user_header_view = this;
        user_header_view.$('.unfollow').x_loading();
        snapr.utils.require_login( function(){
            user_header_view.model.unfollow(function(){
                user_header_view.$('.unfollow').x_loading(false);
            });
        })();
    }

});
});
