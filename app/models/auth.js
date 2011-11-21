tripmapper.models.auth = Backbone.Model.extend({
    url:function(){
        return tripmapper.access_token_url;
    },
    get_token: function(username,password,options){
        this.data = {
            'grant_type':'password',
            'client_id':tripmapper.client_id,
            'client_secret':tripmapper.client_secret,
            'username': username,
            'password': password,
            '_method':'POST'
        }
        var _this = this;
        var opt = {
            success: function(response){
                console.warn('response',response,_this)
                if(_this.get("access_token")){
                    _this.set({username:username});
                    _this.save_locally();
                    delete _this.data;
                    if(typeof options.success == 'function'){
                        console.warn('success == function');
                        options.success();
                    }
                }else{
                    delete _this.data;
                    if(typeof options.error == 'function'){
                        console.warn('error == function');
                        options.error(_this.get('error_description'));
                    }
                }
            },
            error: function(){
                if(typeof options.error == 'function'){
                    console.warn('error == function');
                    options.error(_this.get('error_description'));
                }
            }
        }
        this.fetch(opt);
    },
    get_locally: function(){
        if (tripmapper.info.supports_local_storage) {
            var snapr_user = localStorage.getItem('snapr_user');
            var access_token = localStorage.getItem('access_token');
        } else {
            var snapr_user = $.cookie('snapr_user');
            var access_token = $.cookie('access_token');
        }
        if(snapr_user && access_token){
            this.set({access_token:access_token,username:snapr_user});
        }
    },
    save_locally:function(){
        var snapr_user = this.get('username');
        var access_token = this.get('access_token');
        
        if (tripmapper.info.supports_local_storage) {
            localStorage.setItem('snapr_user', snapr_user);
            localStorage.setItem('access_token', access_token);
        } else {
            $.cookie('snapr_user', snapr_user);
            $.cookie('access_token', access_token);
        }
    },
    logout:function(){
        this.unset('username');
        this.unset('access_token');
        if (tripmapper.info.supports_local_storage) {
            var snapr_user = localStorage.removeItem('snapr_user');
            var access_token = localStorage.removeItem('access_token');
        } else {
            $.cookie('snapr_user', null);
            $.cookie('access_token', null);
        }
    }
});