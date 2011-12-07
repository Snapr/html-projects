tripmapper.views.user_profile = Backbone.View.extend({
    
    initialize: function()
    {
        // this.template = _.template( $("#user-header-template").html );
        this.el.find("h1").text('Username');
        this.el.find("[data-role='content']").empty();
        
        this.model = new tripmapper.models.user( {username: this.options.query.username} );
        
        var user_profile = this;
        
        this.model.bind( "change", function()
        {
            user_profile.render();
        });
        
        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map' )
        {
            var transition = "flip";
        }
        else
        {
            var transition = "slidedown";
        }
        
        $.mobile.changePage( $("#user-profile"), {
            changeHash: false,
            transition: transition
        });
        
        this.model.fetch();
    },
    
    render: function()
    {
        console.warn('render', this)
        this.el.find("h1").text(this.model.get("user").username);
        this.el.find("[data-role='content']").append(this.model.get("details").profile.bio);
    }
    
});