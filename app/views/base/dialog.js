// Abstract base class for dialogs
// adds the "back" function

/*global _ Route define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    initialize: function(){
        _.bindAll( this );

        this.events = _.extend(this.events, {
            "click .x-back": "back"
        });

        this.back_view = this.options.back_view;

        this.$el.on("pageshow", this.set_prev_page );

        this.post_initialize.apply(this, arguments);
        this.activate.apply(this, arguments);
    },

    activate: function(){
        this.change_page();
    },

    change_page: function( options ){
        options = _.extend({
            transition: this.transition
        }, options || {});
        page_view.prototype.change_page.apply(this, options);
    },

    set_prev_page: function( e, ui ){
        this.prev_el = ui.prevPage;
    },

    back: function(){
        if (this.previous_view){

            this.previous_view.change_page({
                changeHash: false,
                transition: this.transition,
                reverse: true
            });
            snapr.info.current_view = this.previous_view;
        }else{
            console.error('NO WAY OUT OF DIALOG! Tell Jake.');
        }
        // else if (this.back_view){
        //     console.debug('this.back_view',this.back_view);

        //     this.back_view.change_page({
        //         changeHash: false,
        //         transition: this.transition,
        //         reverse: true
        //     });
        // }else if (this.prev_el && this.prev_el.length){
        //     console.debug('this.prev_el',this.prev_el);
        //     $.mobile.changePage( this.prev_el, {
        //         changeHash: false,
        //         transition: this.transition,
        //         reverse: true
        //     });
        //     //window.history.back();
        // }else{
        //     console.debug('back');
        //     //window.history.back();
        // }

    },

    transition: "slideup"

});

});
