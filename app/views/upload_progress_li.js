tripmapper.views.upload_progress_li = Backbone.View.extend({
    
    tagName: "li",
    
    initialize: function( init_options )
    {
        this.template = init_options.template;
        this.upload = init_options.upload;
    },
    
    events: {
        "click .cancel": "cancel_upload"
    },
    
    render: function()
    {

        $(this.el).append( 
            this.template({
                thumbnail: "https://s3.amazonaws.com/media-server2.snapr.us/thm/f06bfa40d66e45ef8c63f9fecd613fbb/YZJ.jpg",
                percent_complete: this.upload.percent_complete
            })
        );

        return this;
    },
    
    cancel_upload: function()
    {
        console.warn( "cancel upload", this );
    }
    
});