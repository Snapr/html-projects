tripmapper.views.login = Backbone.View.extend({
    el: $('#login'),
    events: {
        "submit #login-dialog":"get_auth_token"
    },
    initialize: function(){
        // console.warn('init login')
        $.mobile.changePage($("#login"),{changeHash:false,transition:"slidedown"});
        if(!tripmapper.auth){
            // console.warn('no auth')
            tripmapper.auth = new tripmapper.models.auth;
            tripmapper.auth.url = tripmapper.access_token_url;
        }
    },
    get_auth_token: function(){
        // console.warn('get_auth_token')
        var username = $("#login-dialog-username").val();
        var password = $("#login-dialog-password").val();
        if(tripmapper.auth){
            tripmapper.auth.data = {
                    'grant_type':'password',
                    'client_id':tripmapper.client_id,
                    'client_secret':tripmapper.client_secret,
                    'username': username,
                    'password': password,
                    '_method':'POST'
            }
            // tripmapper.auth.bind('change:username',function(){
            //     console.warn('reset username');
            // });
            // tripmapper.auth.bind('change:access_token',function(){
            //     console.warn('reset access_token');
            // });
            var options = {
                success: function(response){
                    if(tripmapper.auth.get("access_token")){
                        console.warn("access_token", tripmapper.auth.get("access_token"));
                        delete tripmapper.auth.data;
                        $("#login-dialog-username").val('');
                        $("#login-dialog-password").val('');
                        tripmapper.auth.set({username:username});
                        if(window.location.hash == "#login"){
                            window.history.back();
                        }else{
                            Route.navigate(window.location.hash,true);
                        }
                    }else{
                        console.warn('response',response);
                        delete tripmapper.auth.data;
                        alert(response.get("error_description") || "Sorry, we had trouble logging in. Please try again.");
                    }
                },
                error: function(error){
                    console.warn('error',error);
                }
            }
            tripmapper.auth.fetch(options);
        }else{
            console.warn('no auth')
        }
    }
});