// Abstract base class for pages
// sets the page element and binds pagehide

snapr.views.page = Backbone.View.extend({

    initialize: function()
    {
        snapr.current_view = this;
        $(this.options.el).undelegate();
        this.setElement( this.options.el );

        this.$el.on( "pagebeforehide", function( e, to ){
            try{  // sometimes some part of to.nextPage[0].dataset.role is undefined

                if (to.nextPage[0].dataset.role != "dialog"){
                    //not going to dialog - undelegate
                    $(e.target).undelegate();
                }

            }catch(e){}

            return true;
        });

        var page = this;
        this.$el.on( "pagebeforeshow", function(e, options){
            console.debug('options', options);
            var back_text;
            if(history.state && history.state.back_text){
                back_text = history.state.back_text;
                console.debug('back from history state: '+back_text);
            }else if(options.prevPage){
                back_text = options.prevPage.data('back_text-title') || options.prevPage.data('short-title') || options.prevPage.data('title');
                console.debug('prevPage backtext, short title, title', options.prevPage.data('back_text-title'), options.prevPage.data('short-title'), options.prevPage.data('title'));
                console.debug('back from options: '+back_text);
            }else{
                console.debug("no back text from hisory or options.prevPage");
            }

            page.set_back_text(back_text);
        });

        _.bindAll( this );
    },

    set_back_text: function(text){
        if(text){
            this.$("[data-rel='back'] .ui-btn-text").text(text);
            window.history.replaceState({'back_text': text}, 'title', window.location);
        }
        return this;
    },

    change_page: function( options ){

        options = _.extend({
            changeHash: false
        }, options || {});
        $.mobile.changePage( this.$el, options);
    }

});
