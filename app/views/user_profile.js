snapr.views.user_profile = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();
            $(e.target).find( ".user-profile" ).empty();

            return true;
        });
        //this.el.find("h1").text('Username');
        //this.el.find("[data-role='content']").empty();
        this.model = new snapr.models.user( {username: this.options.query.username} );

        this.template = _.template( $("#user-profile-template").html() );

        this.model.bind( "change", this.render );

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
        this.el.find( ".user-profile" ).html( this.template({
            user: this.model
        }) );
        this.el.trigger( "create" );

        //this.el.find("h1").text(this.model.get("user").username);
        //this.el.find("[data-role='content']").append(this.model.get("details").profile.bio);
    }

});