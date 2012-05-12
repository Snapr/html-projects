snapr.views.home = snapr.views.page.extend({

    initialize: function()
    {
        snapr.views.page.prototype.initialize.call( this );

        this.template = _.template( $("#home-template").html() );

        snapr.auth.bind("change", this.render);

        if ($.mobile.activePage && $.mobile.activePage.find("#home").length < 1)
        {
            $.mobile.changePage( "#home" );
            this.render();
        }
    },

    render: function()
    {
        this.$el
            .find("[data-role='content']")
            .html( this.template( {
                logged_in: snapr.auth.has("access_token"),
                username: snapr.auth.get("snapr_user")
            } ))
            .trigger("create");

        return this;
    },

    upload_count: function( count )
    {
        // if (count)
        // {
        //     Route.navigate( '#/uploading/' );
        // }
    },


});
