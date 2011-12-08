tripmapper.views.people_li = Backbone.View.extend({

    initialize: function()
    {
        this.template = this.options.template;

        var people_li = this;

    },

    tagName: 'li',

    render: function(){
        $(this.el).empty().append( this.template({
            user: this.model,
            auth_username: tripmapper.auth.get('username')
        }) );

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