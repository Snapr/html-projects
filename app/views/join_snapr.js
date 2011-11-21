tripmapper.views.join_snapr = Backbone.View.extend({
    el:$('#join-snapr'),
    events:{
        "change #snapr-tos":"toggle_tos",
        "submit #join-dialog":"join"
    },
    initialize:function(){
        $.mobile.changePage($("#join-snapr"),{changeHash:false});
    },
    render:function(){
    },
    toggle_tos:function(e){
        if(e.target.checked){
            this.el.find('input[type="submit"]').button('enable');
        }else{
            this.el.find('input[type="submit"]').button('disable');
        }
    },
    join:function(){
        var new_user = new tripmapper.models.user_settings;
        new_user.data = {
           username: this.el.find("#join-dialog-username").val(),
           password: this.el.find("#join-dialog-password").val(),
           email: this.el.find("#join-dialog-email").val(),
           client_id: tripmapper.client_id
        }
        
        _this = this;
        
        // these options will be triggered on login (after successful join)
        var login_options = {
            success:function(){
                // empty all the forms
                _this.el.find("#join-dialog-username").val('');
                _this.el.find("#join-dialog-password").val('');
                _this.el.find("#join-dialog-email").val('')
                // go back to home screen
                Route.navigate('#',true);
            },
            error:function(){
                console.warn('error on login after successful join');
            }
        }
        // these options will be triggered on join
        var join_options = {
            success:function(s){
                if(s.get('success')){
                    tripmapper.auth.get_token(new_user.data.username,new_user.data.password,login_options);
                }else{
                    alert(s.get('error').message);
                    console.warn(s.get('error').message);
                }
            },
            error:function(e){
                console.warn('error',e);
            }
        }
        // save creates a new user
        new_user.save({},join_options);
    }
});




