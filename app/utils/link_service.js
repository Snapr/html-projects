/*global _  define require */
define(['config', 'backbone', 'utils/local_storage', 'auth', 'utils/dialog'], function(config, Backbone, local_storage, auth, dialog){
return function(service, next, signin){
    var url,
        action = signin ? 'signin' : 'oauth';
    if (service == 'twitter' && config.get('twitter_xauth')){
        //dialog('twitter-xauth/');
        url = '#/twitter-xauth/?redirect='+ escape( next );
        Backbone.history.navigate( url );
    }else if (service == 'tumblr' && config.get('tumblr_xauth')){
        //dialog('tumblr-xauth/');
        url = '#/tumblr-xauth/?redirect='+ escape( next );
        Backbone.history.navigate( url );
    }else{
        if (local_storage.get( "appmode" )){
            next = "snapr://redirect?redirect_url=" + escape( next );
        }

        var params;
        if(signin){
            params = {
                redirect: next,
                display: 'touch',
                client_id: config.get("client_id"),
                client_secret: config.get("client_secret")
            };
        }else{
            params = {
                redirect: next,
                display: 'touch',
                access_token: auth.get("access_token")
            };
        }

        url = config.get('api_base') + "/linked_services/" + service + "/"+ action +
            "/?" + $.param(params);

        if(local_storage.get("appmode") == 'android'){
            url = "snapr://link?url=" + escape(url);
        }

        window.location = url;
    }
};

});
