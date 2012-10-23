/*global _  define require */
define(['config', 'views/base/page', 'auth', 'utils/alerts'], function(config, page_view, auth, alerts){
return page_view.extend({

    post_activate: function(options){

        if (options.query){
            this.redirect = options.query.redirect;
            this.message = options.query.message;
        }

        if (this.message){
            this.$(".x-login-message").text(this.message);
        }else{
            this.$(".x-login-message").text("");
        }

        this.change_page();
    },

    events: {
        "submit form":"link_tumblr",
        "click .x-tumblr-button":"link_tumblr"
    },

    link_tumblr: function(){

        $.mobile.showPageLoadingMsg();

        var this_view = this;
        $.ajax({
            url: config.get('api_base') + '/linked_services/tumblr/xauth/',
            type: 'GET',
            dataType: 'jsonp',
            data:{
                username: $('.x-username').val(),
                password: $('.x-password').val(),
                access_token: auth.get("access_token"),
                _method: "POST"
            },
            success: function( data ){
                if(data.success){
                    $('.x-username').val("");
                    $('.x-password').val("");
                    if(this_view.redirect){
                        var redirect = (this_view.redirect.indexOf("?") > -1) ?
                            this_view.redirect + "&username=" + data.response.username :
                            this_view.redirect + "?username=" + data.response.username;
                        window.location = redirect;
                    }else{
                        this_view.back();
                    }

                }else{
                    alerts.notification('Oops!', 'Your Tumblr login details were incorrect.');
                    console.warn(data);
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
