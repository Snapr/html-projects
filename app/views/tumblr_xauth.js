/*global _ Route define require */
define(['views/base/page', 'auth', 'utils/alerts'], function(page_view, auth, alerts){
return page_view.extend({

    post_activate: function(options){

        if (options.query){
            this.redirect = unescape( options.query.redirect );
            this.message = options.query.message;
        }

        if (this.message){
            this.$el.find(".login-message").text(this.message);
        }else{
            this.$el.find(".login-message").text("");
        }

        this.change_page();
    },

    events: {
        "submit #tumblr-dialog":"link_tumblr",
        "click .tumblr-button":"link_tumblr"
    },

    link_tumblr: function(){

        $.mobile.showPageLoadingMsg();

        var this_view = this;
        $.ajax({
            url: snapr.api_base + '/linked_services/tumblr/xauth/',
            type: 'GET',
            dataType: 'jsonp',
            data:{
                username: $('#tumblr-username').val(),
                password: $('#tumblr-password').val(),
                access_token: auth.get("access_token"),
                _method: "POST"
            },
            success: function( data ){
                if(data.success){
                    if(this_view.redirect){
                        var redirect = (this_view.redirect.indexOf("?") > -1) ?
                            this_view.redirect + "&username=" + data.response.username :
                            this_view.redirect + "?username=" + data.response.username;
                        window.location = redirect;
                    }else{
                        this_view.back();
                    }

                }else{
                    console.error(data);
                    alerts.notification('Oops!', 'Your Tumblr login details were incorrect.');
                }
            },
            error: function( data ){
                console.error('ajax error!');
            },
            complete: function(){
                $.mobile.hidePageLoadingMsg();
            }
        });
    }
});

});
