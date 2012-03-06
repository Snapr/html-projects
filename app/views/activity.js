snapr.views.activity = Backbone.View.extend({

    el: $('#activity'),

    events: {
       // "click #popular-timeframe a":"update_list"
    },

    initialize: function()
    {
        console.log('activity');

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        $.mobile.changePage( $("#activity"), {
            changeHash: false
        });

    },


})
