snapr.views.cities = Backbone.View.extend({

    el: $('#cities'),

    events: {
       // "click #popular-timeframe a":"update_list"
    },

    initialize: function()
    {
        console.log('cities');

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        $.mobile.changePage( $("#cities"), {
            changeHash: false
        });

    },


})
