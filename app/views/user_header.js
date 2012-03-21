snapr.views.user_header = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        this.template = _.template( $("#user-header-template").html() );
        var user_header = this;

        this.model.bind( "change", this.render );

        this.model.fetch({
            error: function()
            {
                console.log( "error fetching user in user_header" );
            }
        });
    },

    render: function()
    {
        this.el.empty().append( this.template({
            user: this.model,
            auth_username: snapr.auth.get( "snapr_user" ),
            logged_in: snapr.auth.has( "access_token" ),
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
        snapr.utils.require_login( function(){
                user_header_view.model.follow();
        })();
    },

    unfollow: function()
    {
        var user_header_view = this;
        snapr.utils.require_login( function(){
                user_header_view.model.unfollow();
        })();
    }

});
