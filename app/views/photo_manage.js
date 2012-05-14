snapr.views.photo_manage = Backbone.View.extend({

    initialize: function()
    {
        _.bindAll( this );
        $(this.options.el).undelegate();
        this.setElement( this.options.el );
        this.parentView = this.options.parentView;
        this.template = _.template( $("#photo-manage-template").html() );

        // update the display when we change the photo
        this.model.bind( "change:status", this.render );
        this.model.bind( "change:flagged", this.render );
    },

    events: {
        "click .x-image-privacy": "toggle_status",
        "click .x-image-flag": "flag",
        "click .x-image-delete": "delete"
    },

    render: function()
    {
        this.$el.html( this.template({
            status: this.model.get("status"),
            flagged: this.model.get("flagged"),
            mine: this.model.get("username") == snapr.auth.get("snapr_user")
        })).trigger("create");

        return this;
    },

    toggle_status: function()
    {
        var photo_manage = this;
        var current_status = this.model.get('status');

        photo_manage.$('.x-image-privacy').x_loading();

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
                    photo_manage.$('.x-image-privacy').x_loading(false);
                },
                error: function( e )
                {
                    console.warn("error changing status", e);
                    photo_manage.$('.x-image-privacy').x_loading(false);
                }
            });
        }
    },

    flag: function()
    {
        var photo_manage = this;
        photo_manage.$('.x-image-flag').x_loading();
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
                    photo_manage.$('.x-image-flag').x_loading(false);
                },
                error: function( e )
                {
                    console.warn("error flagging photo", e);
                    photo_manage.$('.x-image-flag').x_loading(false);
                }
            });
        })();
    },

    delete: function()
    {
        var photo_manage = this;
        photo_manage.$('.x-image-delete').x_loading();
        snapr.utils.require_login( function()
        {
            snapr.utils.approve({
                'title': 'Are you sure you want to delete this photo?',
                'yes': 'Delete',
                'no': 'Cancel',
                'yes_callback': function(){
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
                        photo_manage.$('.x-image-delete').x_loading(false);
                    },
                    error: function( e )
                    {
                        console.warn("error deleting photo", e);
                        photo_manage.$('.x-image-delete').x_loading(false);
                    }
                });
            },
                'no_callback': function(){ photo_manage.$('.x-image-delete').x_loading(false); }
            });

        })();
    }

});
