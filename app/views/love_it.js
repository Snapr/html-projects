snapr.views.love_it = Backbone.View.extend({
    initialize: function()
    {
        this.template = _.template( $("#love-it-template").html() );
        this.photo_path =  "http://placehold.it/200x200";
        this.shared = this.options.query.shared || false;

        this.el.live( "pagehide", function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });

        $.mobile.changePage( $("#love-it"), {changeHash: false} );
        this.render();
    },
    
    render: function()
    {
        $(this.el).find("[data-role='content']").html( this.template({shared: this.shared, img_url: this.photo_path }) ).trigger("create");
        
        return this;
    }
    
});