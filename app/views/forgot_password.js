/*global _  define require */
define(['config', 'views/base/page', 'utils/alerts'], function(config, page_view, alerts){
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
            url: config.get('api_base') + '/user/forgot_password/',
            data: data,
            dataType: 'jsonp',
            success: function(response){
                    console.debug(response);
                if(response.success){
                    forgot_view.$("#forgot-form input[name=username]").val('');
                    alerts.notification("success", 'A password reset link has been emailed to you.');
                }else{
                    alerts.notification('Error', 'Sorry, we had trouble with that. ' + response.error.message);
                }
            },
            error: function(){
                alerts.notification('Error', "Sorry, we had trouble with that. Please try again." );
            }
        });
    }
});

});
