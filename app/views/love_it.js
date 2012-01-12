snapr.views.love_it = Backbone.View.extend({
    initialize: function()
    {
        _.bindAll( this );
        this.el.live( "pagehide", function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });

        $.mobile.changePage( $("#love-it"), {changeHash: false} );

        this.template = _.template( $("#love-it-template").html() );

        // this.photo_path =  "http://placehold.it/200x200";
        this.shared = this.options.query.shared || false;

        if (this.options.query.photo_path)
        {
            this.photo_path = this.options.query.photo_path;
            this.render();
        }
        else if (this.options.query.photo_id || this.options.query.photo)
        {
            this.model = new snapr.models.photo({id: this.options.query.photo_id || this.options.query.photo});
            this.model.bind("change", this.render);
            this.model.fetch();
        }
        else
        {
            console.warn( "error, no photo_id and no photo_path" );
        }
    },
    
    render: function()
    {
        if (this.model)
        {
            var img_url = "http://media-server2.snapr.us/sml/" 
                + this.model.get("secret") + "/" 
                + this.model.get("id") + ".jpg";
        }
        else
        {
            var img_url = this.photo_path;
        }
        $(this.el).find("[data-role='content']").html( this.template({shared: this.shared, img_url: img_url }) ).trigger("create");
        
        return this;
    }
    
});