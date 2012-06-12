// Abstract base class for dialogs
// adds the "back" function

/*global _ Route define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    initialize: function(){
        _.bindAll( this );

        this.events = _.extend(this.events || {}, {
            "click .x-back": "back"
        });

        this.back_view = this.options.back_view;

        this.post_initialize.apply(this, arguments);
        this.activate.apply(this, arguments);
        $(document.body).show();
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

    change_hash: true,

    back: function(){
        if (this.previous_view){
            this.previous_view.change_page({
                changeHash: this.change_hash,
                transition: this.transition,
                reverse: true
            });
            snapr.info.current_view = this.previous_view;
        }else{
            Route.navigte('#');
        }

    },

    transition: "slideup"

});

});
