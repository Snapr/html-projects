/*global _ Route define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    post_activate: function(){

        this.change_page();

        if(this.options.query && this.options.query.back_url){
            var back_url = this.options.query.back_url;
            this.$('[data-role=header] .ui-btn-right').attr('href', unescape(back_url)).attr('data-ajax', false).removeClass('x-back');
            $.each(this.$('.find-friends-link'), function(){
                $(this).attr('href', $(this).attr('href') + '?back_url=' + escape(window.location.href));
            });
        }
    }
});

});
