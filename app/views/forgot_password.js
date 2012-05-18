snapr.views.forgot_password = snapr.views.dialog.extend({

    initialize: function(){
        snapr.views.dialog.prototype.initialize.call( this );

        this.change_page({
            transition: this.transition
        });
    },

    events: {
        "submit #forgot-form":"forgot",
        "click .x-back": "back"
    },

    forgot: function()
    {
        var username = this.$("#forgot-form input[name=username]").val();

        var data = {_method: 'POST'};
        // maybe this should be detected api-side
        if(username.indexOf('@') > -1){
            data['email_address'] = username;
        }else{
            data['username'] = username;
        }

        var forgot_view = this;
         $.ajax({
            url:snapr.api_base + '/user/forgot_password/',
            data: data,
            dataType: 'jsonp',
            success: function(response){
                    console.debug(response);
                if(response.success){
                    forgot_view.$("#forgot-form input[name=username]").val('');
                    alert('A password reset link has been emailed to you.');
                }else{
                    alert('Sorry, we had trouble with that. ' + response.error.message);
                }
            },
            error: function(){
                alert( "Sorry, we had trouble with that. Please try again." );
            }
        });
    }
});
