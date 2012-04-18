snapr.views.connect_li = Backbone.View.extend({

    tagName: "li",

    initialize: function()
    {
        _.bindAll( this );
        this.template = _.template( $("#connect-li-template").html() );
        this.provider = this.options.provider || null;
        this.status = this.options.status || null;
        this.photo_id = this.options.photo_id || null;
        this.parent_view = this.options.parent_view || null;

        if (this.photo_id && this.status == "ready")
        {
            this.share();
        }
    },

    render: function()
    {
        this.$el
            .attr("data-role", "fieldcontain")
            .html( this.template({
                provider: this.provider,
                status: this.status
            }))
            .trigger("create")

        return this;
    },

    events: {
        "submit .tumblr-login": "link_service",
        "click .connect": "link_service"
    },

    link_service: function(e)
    {
        this.parent_view.to_link.pop( this.provider );
        var to_link = this.parent_view.to_link;
        this.parent_view.shared.push( this.provider );
        var shared = this.parent_view.shared;

        var redirect_params = {};

        if (shared.length)
        {
            redirect_params["shared"] = shared.join(",");
        }
        if (this.photo_id)
        {
            redirect_params["photo_id"] = this.photo_id;
        }
        if (to_link.length)
        {
            redirect_params["to_link"] = to_link.join(",");
        }

        var redirect = window.location.origin +
            window.location.pathname +
            window.location.hash.split("?")[0] +
            "?" + $.param( redirect_params );
        url = snapr.api_base + "/linked_services/"
            + this.provider + "/oauth/?access_token=" + snapr.auth.get("access_token") + "&redirect=" + escape( redirect );

        console.log(url);
        window.location = url;
    },

    share: function()
    {
        this.model = new snapr.models.photo({id: this.photo_id});

        var connect_li = this;

        var options = {
            success: function( model, xhr )
            {
                // console.log("share success", model, xhr);
                connect_li.status = "shared";
                connect_li.render();
                if (connect_li.parent_view.to_link.length == 0)
                {
                    setTimeout(function()
                    {
                        Route.navigate("#/love-it/?shared=true&photo_id=" + model.get("id"));
                    }, 600);
                }
            },
            error: function( error )
            {
                console.log("share error", error);
            }
        }

        switch (this.provider)
        {
            case "facebook":
                this.model.save({
                    facebook_gallery: true
                }, options);
                break;
            case "tumblr":
                this.model.save({
                    tumblr: true
                }, options);
                break;
        }
    }

});
