snapr.views.about = Backbone.View.extend({

    el: $('#about'),

    events: {
       // "click #popular-timeframe a":"update_list"
    },

    initialize: function()
    {
        console.warn('about');

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        $.mobile.changePage( $("#about"), {
            changeHash: false
        });

    },


})