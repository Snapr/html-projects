snapr.views.pink_hearts = Backbone.View.extend({
    initialize: function()
    {
        this.el.live( "pagehide", function( e )
        {
            $(e.target).find(".iframe-content").empty();
            $(e.target).undelegate();
            
            return true;
        });

        var iframe = $("<iframe style='border:none;width:100%;height:" + (window.innerHeight - 40) + "px;' src='http://pink.victoriassecret.com/m/pink_hearts/' />");

        $(this.el).find(".iframe-content").html( iframe );

        $.mobile.changePage( $("#pink-hearts"), {
            transition: "slide",
            changeHash: false
        });
    }
});