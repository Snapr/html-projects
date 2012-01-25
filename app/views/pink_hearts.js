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

        if (snapr.utils.get_local_param("appmode"))
        {
            switch (snapr.utils.get_local_param("appmode").toLowerCase())
            {
                case "iphone":
                    $(iframe).attr("src", "http://pink.victoriassecret.com/m/pink_hearts/index.jsp?device=iphone");
                    break;
                case "android":
                    $(iframe).attr("src", "http://pink.victoriassecret.com/m/pink_hearts/index.jsp?device=android");
                    break;
            }
        }

        $(this.el).find(".iframe-content").html( iframe );

        $.mobile.changePage( $("#pink-hearts"), {
            transition: "slide",
            changeHash: false
        });
    }
});