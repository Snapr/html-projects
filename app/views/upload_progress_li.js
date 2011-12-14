tripmapper.views.upload_progress_li = Backbone.View.extend({
    
    tagName: "li",
    
    initialize: function( init_options )
    {
        this.template = init_options.template;
        this.photo = init_options.photo;
    },
    
    events: {
        "click .cancel": "cancel_upload"
    },
    
    render: function()
    {

        $(this.el).append( 
            this.template({
                thumbnail: this.photo.thumbnail,
                percent_complete: this.photo.percent_complete
            })
        );

        return this;
    },
    
    cancel_upload: function()
    {
        console.warn( "cancel upload", this );
    }
    
});