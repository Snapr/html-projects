snapr.views.photo_manage = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );

        this.template = _.template( $("#photo-manage-template").html() );
        // update the display when we change the photo
        this.model.bind( "change", this.render );
    },

    events: {
        "click .x-image-privacy": "toggle_status",
        "click .x-image-flag": "toggle_flag",
        "click .x-image-delete": "delete"
    },

    render: function()
    {
        console.warn("render", this.model)
        $(this.el).html( this.template({
            status: this.model.get("status"),
            flagged: this.model.get("flagged"),
            mine: this.model.get("username") == snapr.auth.get("snapr_user")
        }));

        $(this.el).trigger("create");

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

    toggle_flag: function()
    {
        console.warn("flag")
        var photo_manage = this;
        snapr.utils.require_login( function()
        {

        });
    },

    delete: function()
    {
        console.warn("delete");
    }

});