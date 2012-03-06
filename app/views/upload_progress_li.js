snapr.views.upload_progress_li = Backbone.View.extend({

    tagName: "div",

    initialize: function()
    {
        this.template = this.options.template;
        this.photo = this.options.photo;
    },

    events: {
        "click .cancel": "cancel_upload"
    },

    render: function()
    {
        // check that the progress hasn't already reached 100%
        if (!$(this.el).find(".finishing").length)
        {
            $(this.el).html(
                this.template({
                    upload_status: this.photo.upload_status,
                    img_url: this.photo.thumbnail,
                    percent_complete: this.photo.percent_complete
                })
            );

            if (this.photo.percent_complete == 100)
            {
                $(this.el).find(".finishing").spin({
                    lines:10,
                    length:3,
                    width:2,
                    radius:3,
                    trail:50,
                    speed:1.0,
                    color:'#000000'
                });
            }
        }

        return this;
    },

    cancel_upload: function()
    {
        var id = this.photo.id;
        snapr.utils.approve({
            "title": "Cancel this upload?",
            "yes_callback": function()
            {
                if (snapr.utils.get_local_param( "appmode" ))
                {
                    pass_data( "snapr://upload?cancel=" + id );
                }
            }
        });

        console.log( "cancel upload", this );
    }

});
