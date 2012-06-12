// Abstract base class for pages

/*global _ Route define require */

/*
things to deine:
Page{
    post_initialize{
        things to do once only - when view first used
    }
    activate{
        everytime the view is shown
        responsible for calling render
    }
    render{
        everytime view is showen or something changes
    }
}
*/
define(['backbone'], function(Backbone){

return Backbone.View.extend({

    initialize: function(options){
        _.bindAll( this );

        this.post_initialize.apply(this, arguments);

        var page = this;
        this.$el.on( "pagebeforeshow", function(e, options){

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

        this.activate.apply(this, arguments);
        $(document.body).show();
    },

    post_initialize: function(){},

    activate: function(){},

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
});
