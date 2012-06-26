/*global _  define require */
define(['config', 'backbone', 'views/base/page', 'auth', 'utils/alerts'], function(config, Backbone, page_view, auth, alerts){
return page_view.extend({

    post_activate: function(options){

        if (options.query){
            this.redirect = options.query.redirect;
            this.message = options.query.message;
            this.signin = !!options.query.signin;

            if (options.query.message){
                this.$el.find(".login-message").text(options.query.message);
            }else{
                this.$el.find(".login-message").text("");
            }
        }else{
            delete this.redirect;
            delete this.signin;
        }

        this.change_page();
    },

    events: {
        "submit #twitter-dialog":"link_twitter",
        "click .twitter-button":"link_twitter"
    },

    link_twitter: function(){
        var options,
            xauth_view = this;

        $.mobile.showPageLoadingMsg();

        if(this.signin){
            options = {
                url: config.get('api_base') + '/linked_services/twitter/xauth/signin/',
                data:{
                    client_id: config.get('client_id'),
                    client_secret: config.get('client_secret'),
                    _method: "POST"
                },
                success: function( data ){
                    if(data.success){
                        if(data.response.access_token){
                            //login
                            auth.set({
                                "access_token": data.response.access_token,
                                "snapr_user": data.response.snapr_user
                            });
                            auth.save_locally();
                            alerts.notification('Logged in as ' + data.response.snapr_user);
                            Backbone.history.navigate("#/");
                        }else{
                            // sign up
                            Backbone.history.navigate( "#/join/?linked=true&twitter_name="+data.response.username+"&twitter_token="+escape(data.response.twitter_token) );
                        }
                    }else{
                        console.error(data);
                        alerts.notification('Oops!', 'Your Twitter login details were incorrect.');
                    }
                },
                complete: function(){
                    $.mobile.hidePageLoadingMsg();
                }
            };
        }else{
            options =  {
                url: config.get('api_base') + '/linked_services/twitter/xauth/',
                data:{
                    access_token: auth.get("access_token"),
                    _method: "POST"
                },
                success: function( data ){
                    if(data.success){
                        if(xauth_view.redirect){
                            var redirect = (xauth_view.redirect.indexOf("?") > -1) ?
                                xauth_view.redirect + "&":
                                xauth_view.redirect + "?";
                            window.location = redirect + $.param(data.response);
                        }else{
                            xauth_view.back();
                        }
                    }else{
                        console.error(data);
                        alerts.notification('Oops!', 'Your Twitter login details were incorrect.');
                    }
                },
                complete: function(){
                    $.mobile.hidePageLoadingMsg();
                }
            };
        }

        $.extend(!!"deep", options, {
            type: 'GET',
            dataType: 'jsonp',
            data:{
                username: $('#twitter-username').val(),
                password: $('#twitter-password').val()
            },
            error: function( data ){
                console.error('ajax error!');
            }
        });

        $.ajax(options);
    }
});

});
