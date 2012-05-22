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

        var page = this;
        this.$el.on( "pagebeforeshow", function(e, options){
            var back_text;
            if(history.state && history.state.back_text){
                back_text = history.state.back_text;
            }else if(options.prevPage){
                back_text = options.prevPage.data('short-title');
            }else{
                //console.debug('BACK', 'no prev page');
            }
            if(back_text)
                //console.debug('BACK', back_text);
                //page.$el.find("[data-role='header'] .ui-btn-left").remove();
                page.$el.find("[data-rel='back'] .ui-btn-text").text(back_text);
                window.history.replaceState({'back_text': back_text}, 'title', window.location);
                //page.$el.attr("data-back-btn-text", back_text);
                //page.$el.trigger("pagecreate");
                //page.$el.data("page").options.backBtnText = back_text;
            });

        _.bindAll( this );
    },

    change_page: function( options )
    {
        // if (this.$el.is("[data-add-back-btn='true']"))
        // {
        //     var page = this;
        //     var back_text = null;
        //     this.$el.on( "pagebeforeshow", function( e, obj )
        //     {
        //         if (obj && obj.prevPage && obj.prevPage.length)
        //         {
        //             if ($(obj.prevPage[0]).attr("id") == "home")
        //             {
        //                 back_text = "Menu";
        //             }
        //         }
        //         snapr.utils.set_header_back_btn_text( page.el, back_text || page.options.query && page.options.query.back );
        //     });
        //     // $(el).find("[data-role='header'] .ui-btn-left").remove();
        //     // $(el).attr("data-back-btn-text", back_text || "Back");
        //     // if ( $(el).data("page") && $(el).data("page").options )
        //     // {
        //     //     $(el).data("page").options.backBtnText = back_text || "Back";
        //     //     $(el).trigger("pagecreate");
        //     // }
        // }

        options = _.extend({
            changeHash: false
        }, options || {});
        $.mobile.changePage( this.$el, options);
    },

});
