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
        $(this.el)
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
        if (this.provider == "tumblr")
        {
            var connect_li = this;
            $.ajax({
                url: snapr.api_base + '/linked_services/tumblr/',
                type: 'POST',
                dataType: 'jsonp',
                data:{
                    username: $('#connect-tumblr-email').val(),
                    password: $('#connect-tumblr-password').val(),
                    access_token: snapr.auth.get("access_token"),
                    _method: "POST"
                },
                success: function( data )
                {
                    if( data.success )
                    {
                        connect_li.status = "ready";
                        connect_li.render();
                        connect_li.parent_view.to_link = _.without(connect_li.parent_view.to_link, connect_li.provider);
                        connect_li.share();
                        
                    }else{
                        alert( data.error.message );
                    }
                },
                error: function( data )
                {
                    console.warn('ajax error!');
                },
            });
            
        }
        else
        {
            url = snapr.api_base + "/linked_services/"
                + this.provider + "/oauth/?access_token=" + snapr.auth.get("access_token") + "&redirect=" + escape( window.location.href );
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
                // console.warn("share success", model, xhr);
                connect_li.status = "shared";
                connect_li.render();
                if (connect_li.parent_view.to_link.length == 0)
                {
                    setTimeout(function()
                    {
                        Route.navigate("#/love-it/?shared=true&photo_id=" + model.get("id"), true);
                    }, 600);
                }
            },
            error: function( error )
            {
                console.warn("share error", error);
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