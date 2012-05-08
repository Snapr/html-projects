snapr.views.twitter_xauth = snapr.views.dialog.extend({

    initialize: function()
    {
        snapr.views.dialog.prototype.initialize.call( this );

        if (this.options.query)
        {
            this.redirect = unescape( this.options.query.redirect );
        }

        if (this.options.query)
        {
            this.message = this.options.query.message;
        }

        if (this.message)
        {
            this.$el.find(".login-message").text(this.message);
        }
        else
        {
            this.$el.find(".login-message").text("");
        }

        this.change_page({
            transition: this.transition
        });
    },

    events: {
        "submit #twitter-dialog":"link_twitter",
        "click .twitter-button":"link_twitter",
        "click .x-back": "back"
    },

    link_twitter: function(){
        var redirect = this.redirect;

        $.ajax({
            url: snapr.api_base + '/linked_services/twitter/xauth/',
            type: 'GET',
            dataType: 'jsonp',
            data:{
                username: $('#twitter-username').val(),
                password: $('#twitter-password').val(),
                access_token: snapr.auth.get("access_token"),
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
                    snapr.utils.notification('Twitter Error', 'Incorrect login details');
                }
            },
            error: function( data ){
                console.error('ajax error!');
            }
        });
    }
});
