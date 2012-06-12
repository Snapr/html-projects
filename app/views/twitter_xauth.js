/*global _ Route define require */
define(['views/base/page', 'auth'], function(page_view, auth){
return page_view.extend({

    post_activate: function(){

        if (this.options.query){
            this.redirect = unescape( this.options.query.redirect );
            this.message = this.options.query.message;
            this.signin = !!this.options.query.signin;
        }

        if (this.message){
            this.$el.find(".login-message").text(this.message);
        }else{
            this.$el.find(".login-message").text("");
        }

        this.change_page();
    },

    events: {
        "submit #twitter-dialog":"link_twitter",
        "click .twitter-button":"link_twitter"
    },

    link_twitter: function(){
        var options,
            xauth_view = this,
            redirect = this.redirect;

        $.mobile.showPageLoadingMsg();

        if(this.signin){
            options = {
                url: snapr.api_base + '/linked_services/twitter/xauth/signin/',
                data:{
                    client_id: snapr.client_id,
                    client_secret: snapr.client_secret,
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
                            snapr.utils.notification('Logged in as ' + data.response.snapr_user);
                            Route.navigate("#/");
                        }else{
                            // sign up
                            Route.navigate( "#/join/?linked=true&twitter_name="+data.response.username+"&twitter_token="+escape(data.response.twitter_token) );
                        }
                    }else{
                        console.error(data);
                        snapr.utils.notification('Oops!', 'Your Twitter login details were incorrect.');
                    }
                },
                complete: function(){
                    $.mobile.hidePageLoadingMsg();
                }
            };
        }else{
            options =  {
                url: snapr.api_base + '/linked_services/twitter/xauth/',
                data:{
                    access_token: auth.get("access_token"),
                    _method: "POST"
                },
                success: function( data ){
                    if(data.success){
                        redirect = (redirect.indexOf("?") > -1) ?
                            redirect + "&":
                            redirect + "?";
                        window.location = redirect + $.param(data.response);
                    }else{
                        console.error(data);
                        snapr.utils.notification('Oops!', 'Your Twitter login details were incorrect.');
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
