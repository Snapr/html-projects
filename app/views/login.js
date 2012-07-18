/*global _  define require */
define(['backbone', 'views/base/page', 'auth', 'utils/alerts', 'utils/link_service'], function(Backbone, page_view, auth, alerts, link_service){
return page_view.extend({

    post_activate: function(){

        if (this.options.query){
            this.message = this.options.query.message;
        }

        if (this.message){
            this.$el.find(".login-message").show().text(this.message);
        }else{
            this.$el.find(".login-message").hide().text("");
        }

        this.change_page();
    },

    events: {
        "submit #login-dialog":"log_in",
        "click .twitter-button": 'twitter_login',
        "click .facebook-button": 'facebook_login'
    },

    log_in: function(){
        var username = $("#login-dialog-username").val();
        var password = $("#login-dialog-password").val();

        if(username === "" || password === ""){
            alerts.notification('Error', 'You must enter your usename and password');
            return;
        }
        $.mobile.showPageLoadingMsg();

        var login_view = this;
        var options = {
            success: function( response ){
                $("#login-dialog-username").val('');
                $("#login-dialog-password").val('');
                if (login_view.previous_view.welcome_view){
                    Backbone.history.navigate( "#/", true );
                }else{
                    login_view.back();
                }
            },
            error: function( error ){
                console.warn("error", error);
                if (error && error.error && error.error == "invalid_grant"){
                    alerts.notification('Error',  "Oops.. Your login or password was incorrect." );
                }else{
                    alerts.notification('Error',  "Sorry, we had trouble logging in. Please try again." );
                }
                $.mobile.hidePageLoadingMsg();
            }
        };
        auth.get_token( username, password, options );
    },
    twitter_login: function(){
        Backbone.history.navigate( "#/twitter-xauth/?signin=true" );
    },
    facebook_login: function(){
        var next = window.location.href;
        next += next.indexOf('?') == -1 ? '?facebook_signin=true' : '&facebook_signin=true';
        link_service('facebook', next, !!'signin');
    }
});

});
