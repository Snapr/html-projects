snapr.views.photo_manage = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.parentView = this.options.parentView;
        this.template = _.template( $("#photo-manage-template").html() );
        // update the display when we change the photo
        this.model.bind( "change", this.render );
    },

    events: {
        "click .x-image-privacy": "toggle_status",
        "click .x-image-flag": "flag",
        "click .x-image-delete": "delete"
    },

    render: function()
    {
        $(this.el).html( this.template({
            status: this.model.get("status"),
            flagged: this.model.get("flagged"),
            mine: this.model.get("username") == snapr.auth.get("snapr_user")
        })).trigger("create");

        return this
    },

    toggle_status: function()
    {
        var photo_manage = this;
        var current_status = this.model.get('status');

        if (current_status == "public")
        {
            var status = "private";
        }
        else if (current_status == "private")
        {
            var status = "public";
        }

        if (status)
        {
            photo_manage.model.change_status( status, {
                success: function( resp )
                {
                    if (resp.success)
                    {
                        photo_manage.model.set({status: status});
                    }
                    else
                    {
                        console.warn("error changing status", resp);
                    }
                },
                error: function( e )
                {
                    console.warn("error changing status", e);
                }
            });
        }
    },

    flag: function()
    {
        var photo_manage = this;
        snapr.utils.require_login( function()
        {
            photo_manage.model.flag({
                success: function( resp )
                {
                    if (resp.success)
                    {
                        photo_manage.model.set({flagged: true});
                    }
                    else
                    {
                        console.warn("error flagging photo", resp);
                    }
                },
                error: function( e )
                {
                    console.warn("error flagging photo", e);
                }
            });
        })();
    },

    delete: function()
    {
        var photo_manage = this;
        snapr.utils.require_login( function()
        {
            photo_manage.model.delete({
                success: function( resp )
                {
                    if (resp.success)
                    {
                        photo_manage.remove();
                        photo_manage.parentView.remove();
                    }
                    else
                    {
                        console.warn("error deleting photo", resp);
                    }
                },
                error: function( e )
                {
                    console.warn("error deleting photo", e);
                }
            });
        })();
    }

});