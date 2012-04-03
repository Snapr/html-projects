snapr.views.app = Backbone.View.extend({

    el: $('#app'),

    events: {
       // "click #popular-timeframe a":"update_list"
    },

    initialize: function()
    {
        console.log('app');

        this.el.live('pagehide', function( e )
        {
            $(e.target).undelegate();

            return true;
        });

        $.mobile.changePage( $("#app"), {
            changeHash: false
        });

    },


})
