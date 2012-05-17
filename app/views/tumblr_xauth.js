snapr.views.tumblr_xauth = snapr.views.dialog.extend({

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
        "submit #tumblr-dialog":"link_tumblr",
        "click .tumblr-button":"link_tumblr",
        "click .x-back": "back"
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
                    snapr.utils.notification('oops', 'your tumblr login details were incorrect');
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
