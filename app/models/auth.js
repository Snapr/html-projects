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
                    options.error();
                }
            }
        }
        this.fetch(opt);
    }
});