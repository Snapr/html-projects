/*global _  define require */
define(['backbone', 'views/base/page', 'auth', 'utils/alerts'], function(Backbone, page_view, auth, alerts){
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
        "click .twitter-button": 'twitter_login'
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
                    alert( "Oops.. Your login or password was incorrect." );
                }else{
                    alert( "Sorry, we had trouble logging in. Please try again." );
                }
                $.mobile.hidePageLoadingMsg();
            }
        };
        auth.get_token( username, password, options );
    },
    twitter_login: function(){
        Backbone.history.navigate( "#/twitter-xauth/?signin=true" );
    }
});

});
