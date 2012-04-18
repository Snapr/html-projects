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

    link_service: function()
    {
        var to_link = _.without( this.parent_view.to_link, this.provider );
        var shared = _.without( this.parent_view.shared, this.provider );

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

        var next = window.location.href.split('?')[0];
        next += "?" + $.param( redirect_params );
        var url;
        if (this.provider == 'tumblr' && snapr.tumblr_xauth)
        {
            url = '#/tumblr-xauth/?redirect='+ escape( escape( next ) + '' );
            Route.navigate( url );
        }
        else
        {
            if (snapr.utils.get_local_param( "appmode" ))
            {
                if (snapr.utils.get_local_param("appmode") == 'iphone')
                {
                    // double encode for iphone - the iOS code should be changed to handle it
                    // without this so this can be removed in future
                    url = snapr.api_base + "/linked_services/"+ provider +
                        "/oauth/?display=touch&access_token=" + snapr.auth.get("access_token") +
                        "&double_encode=true&redirect=" + escape("snapr://redirect?url=" + escape( next ));
                }
                else if(snapr.utils.get_local_param("appmode") == 'android')
                {
                     // android needs a snapr://link?url=
                        url = "snapr://link?url=" + snapr.api_base +
                            "/linked_services/"+ this.provider + "/oauth/?display=touch&access_token=" +
                            snapr.auth.get("access_token") + "&redirect=snapr://redirect?url=" +
                            escape( next );
                }
                else
                {
                    // non-ios builds should be made to handle the redirect param escaped property so
                    // this can be changed to escape("snapr://redirect?url=" + escape( next ))
                    url = snapr.api_base + "/linked_services/"+ this.provider + "/oauth/?display=touch&access_token=" +
                        snapr.auth.get("access_token") +
                        "&redirect=snapr://redirect?url=" + escape( next );
                }
            }
            else
            {
                url = snapr.api_base + "/linked_services/" + this.provider +
                    "/oauth/?display=touch&access_token=" + snapr.auth.get("access_token") +
                    "&redirect=" + escape( next );
            }
            window.location = url;
        }
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
                        Route.navigate("#/uploading/?shared=true&photo_id=" + model.get("id"));
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
