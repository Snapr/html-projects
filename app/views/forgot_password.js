/*global _ Route define require */
define(['views/base/page'], function(page_view){
return page_view.extend({

    events: {
        "submit #forgot-form":"forgot"
    },

    forgot: function(){
        var username = this.$("#forgot-form input[name=username]").val();

        var data = {_method: 'POST'};
        // maybe this should be detected api-side
        if(username.indexOf('@') > -1){
            data.email_address = username;
        }else{
            data.username = username;
        }

        var forgot_view = this;
         $.ajax({
            url: snapr.api_base + '/user/forgot_password/',
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

});
