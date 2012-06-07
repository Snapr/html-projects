/*global _ Route define require */
define(['views/base/dialog'], function(dialog_view){
snapr.views.find_friends = dialog_view.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });

        if(this.options.query && this.options.query.back_url){
            var back_url = this.options.query.back_url;
            this.$('[data-role=header] .ui-btn-right').attr('href', unescape(back_url)).attr('data-ajax', false).removeClass('x-back');
            $.each(this.$('.find-friends-link'), function(){
                $(this).attr('href', $(this).attr('href') + '?back_url=' + escape(window.location.href));
            });
        }
    }
});

return snapr.views.find_friends;
});
