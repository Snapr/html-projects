snapr.views.user_profile = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.$el.find( ".user-profile" ).empty();

        this.model = new snapr.models.user( {username: this.options.query.username} );

        this.template = _.template( $("#user-profile-template").html() );

        this.model.bind( "change", this.render );

        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map')
        {
            var transition = "flip";
        }
        else
        {
            var transition = "slideup";
        }

        this.change_page({
            transition: transition
        });

        this.model.fetch();
    },

    events: {
        "click .x-back": "back"
    },

    render: function()
    {
        this.$el.find( ".user-profile" ).html( this.template({
            user: this.model
        }) );
        this.$el.trigger( "create" );
    }
});