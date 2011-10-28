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
                        $.mobile.changePage("#",{changeHash:false,transition:"slidedown",reverse:true});
                        Route.navigate('',true);
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
        
        
        function login(username, password, callback){

            $('#snapr-loginform').addClass('loading');
            $.ajax({
                url: access_token_url,
                type: 'POST',
                dataType: 'jsonp',
                data:{
                        'grant_type':'password',
                        'client_id':client_id,
                        'client_secret':client_secret,
                        'username': username,
                        'password': password
                }
            }).done(function(response){
                $('#snapr-loginform').removeClass('loading');
                if(response.error){
                    if(response.error_description == "The provided access grant is invalid. (username and password invalid)."){
                        notification("Sorry, we don't recognise your username and password");  
                    }else{
                        notification(response.error_description);
                    }

                }else{
                    snapr_user = username;
                    access_token = response.access_token;
                    $body.addClass('loggedin');
                    update_mysnaps_link();
                    store_user_credentials();

                    // send data to iphone app
                    if(appmode){
                        pass_data('snapr://login?snapr_user='+username+'&access_token='+access_token);
                    }
                    if($.isFunction(callback)){
                        callback();
                    }else{
                        close_overlay();
                        //refresh()
                        update_menu_activity_message();
                        window.location.hash = add_extra_params(window.location.hash);
                    }
                }
            });
        }
        
        
        
    }
});