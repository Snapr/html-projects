snapr.views.tumblr_xauth = Backbone.View.extend({

    events: {
        "submit #tumblr-dialog":"link_tumblr"
    },

    initialize: function()
    {

        this.el.live('pagehide', function( e ){
            $(e.target).undelegate();

            return true;
        });

        if (this.options.query){
            this.redirect = this.options.query.redirect;
            console.log(this.options.query);
        }

        if (this.options.query){
            this.message = this.options.query.message;
        }


        if (this.message){
            $(this.el).find(".login-message").text(this.message);
        }else{
            $(this.el).find(".login-message").text("");
        }

        $.mobile.changePage( $("#tumblr-xauth"), {
            changeHash: false,
            transition: "slideup"
        });
    },

    link_tumblr: function(){
        var redirect = this.redirect;

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

                    window.location.href = redirect + "&username=" + data.response.redirect;
                }else{
                    console.error(data);
                    snapr.utils.notification('Tumblr Error', 'Incorrect login details');
                    //window.location.href = redirect.replace('&linked=tumblr', '');
                }
            },
            error: function( data ){
                console.error('ajax error!');
            }
        });

    }
});
