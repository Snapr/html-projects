// Abstract base class for pages
// sets the page element and binds pagehide

snapr.views.page = Backbone.View.extend({

    initialize: function()
    {
        $(this.options.el).undelegate();
        this.setElement( this.options.el );

        this.$el.on( "pagebeforehide", function( e, to )
        {
            if (to &&
                to.nextPage &&
                to.nextPage[0] &&
                to.nextPage[0].dataset &&
                to.nextPage[0].dataset.role == "dialog")
            {
                // console.log( "going to dialog" );
            }
            else
            {
                // console.log( "not going to dialog - undelegate" );
                $(e.target).undelegate();
            }

            return true;
        });

        _.bindAll( this );
    },

    change_page: function( options )
    {
        if (this.$el.is("[data-add-back-btn='true']"))
        {
            var page = this;
            var back_text = null;
            this.$el.on( "pagebeforeshow", function( e, obj )
            {
                if (obj && obj.prevPage && obj.prevPage.length)
                {
                    if ($(obj.prevPage[0]).attr("id") == "home")
                    {
                        back_text = "Menu";
                    }
                }
                snapr.utils.set_header_back_btn_text( page.el, back_text || page.options.query && page.options.query.back );
            });
        }

        var options = _.extend({
            changeHash: false
        }, options || {});
        $.mobile.changePage( this.$el, options);
    },

});