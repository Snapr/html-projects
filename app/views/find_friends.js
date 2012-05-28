snapr.views.find_friends = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });

        if(this.options.query && this.options.query.back_url){
            var back_url = this.options.query.back_url;
            this.$('.x-back').attr('href', unescape(back_url)).attr('data-ajax', false).removeClass('x-back');
            $.each(this.$('.find-friends-link'), function(){
                $(this).attr('href', $(this).attr('href') + '?back_url=' + escape(window.location.href));
            });
        }
    }
});
