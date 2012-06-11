/*global _ Route define require */
define(['views/base/dialog', 'auth'], function(dialog_view, auth){
return dialog_view.extend({

    activate: function(){

        if (this.options.query){
            this.redirect = unescape( this.options.query.redirect );
            this.message = this.options.query.message;
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
        var redirect = this.redirect;

        $.mobile.showPageLoadingMsg();

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
                    redirect = (redirect.indexOf("?") > -1) ?
                        redirect + "&username=" + data.response.username :
                        redirect + "?username=" + data.response.username;

                    window.location = redirect;
                }else{
                    console.error(data);
                    snapr.utils.notification('Oops!', 'Your Tumblr login details were incorrect.');
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
