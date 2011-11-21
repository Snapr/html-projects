tripmapper.views.login = Backbone.View.extend({
    el: $('#login'),
    events: {
        "submit #login-dialog":"log_in"
    },
    initialize: function(){
        // console.warn('init login')
        $.mobile.changePage($("#login"),{changeHash:false,transition:"slidedown"});
    },
    log_in: function(){
        // console.warn('get_auth_token')
        var username = $("#login-dialog-username").val();
        var password = $("#login-dialog-password").val();

        var options = {
            success: function(response){
                $("#login-dialog-username").val('');
                $("#login-dialog-password").val('');
                if(window.location.hash == "#login"){
                    window.history.back();
                }else{
                    Route.navigate(window.location.hash,true);
                }
            },
            error: function(error){
                alert(error || "Sorry, we had trouble logging in. Please try again.");
            }
        }
        tripmapper.auth.get_token(username,password,options);
    }
});