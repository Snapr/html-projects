tripmapper.views.user_header = Backbone.View.extend({
    
    initialize: function()
    {
        this.template = _.template( $("#user-header-template").html() );
        this.model = new tripmapper.models.user( {username: this.options.username} );
        var user_header = this;
        
        this.model.bind( "change", function()
        {
            user_header.render();
        });
        
        this.model.fetch({
            error: function()
            {
                console.warn( "error fetching user in user_header" );
            }
        });
    },
    
    render: function()
    {
        this.el.empty().append( this.template({
            user: this.model.get('user'),
            auth_username: tripmapper.auth.get('username')
        }) ).trigger("create");
        
        return this;
    },
    
    events: {
        "click .follow": "follow",
        "click .unfollow": "unfollow"
    },
    
    follow: function()
    {
        this.model.follow();
    },
    
    unfollow: function()
    {
        this.model.unfollow();
    }
    
});