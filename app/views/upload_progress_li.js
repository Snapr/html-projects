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

        $(this.el).html( 
            this.template({
                upload_status: this.photo.upload_status,
                img_url: this.photo.thumbnail,
                percent_complete: this.photo.percent_complete
            })
        );

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

        console.warn( "cancel upload", this );
    }
    
});