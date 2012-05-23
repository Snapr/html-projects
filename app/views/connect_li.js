snapr.views.connect_li = snapr.views.linked_service.extend({

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
            .addClass(this.status)
            .html( this.template({
                provider: this.provider,
                status: this.status
            }))
            .trigger("create");

        return this;
    },

    events: {
        "submit .tumblr-login": "link_service",
        "click": "link_service"
    },

    get_return_url: function(){
        var to_link = _.without( this.parent_view.to_link, this.provider );
        var shared = _.without( this.parent_view.shared, this.provider );

        var redirect_params = {linked: this.provider};

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

        var next = window.location.href.split('?')[0];
        next += "?" + $.param( redirect_params );
        // add '' after escaping to dirty the escaped string so that it can be re-escaped later
        // (at least I think that's why it's done)
        return next;
    },

    // link_service inherited from snapr.views.linked_service, uses this.get_return_url
    // link_service: function(){},

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
                if (connect_li.parent_view.to_link.length === 0)
                {
                    setTimeout(function()
                    {
                        Route.navigate("#/uploading/?shared=true&photo_id=" + model.get("id"));
                    }, 600);
                }
            },
            error: function( error )
            {
                console.error("share error", error);
            }
        };

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
