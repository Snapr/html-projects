/*global _  define require */
define(['config', 'backbone', 'utils/local_storage', 'auth', 'utils/dialog'], function(config, Backbone, local_storage, auth, dialog){
return function(service, next){
    var url;
    if (service == 'twitter' && config.get('twitter_xauth')){
        dialog('twitter-xauth/');
        //url = '#/twitter-xauth/?redirect='+ escape( next );
        //Backbone.history.navigate( url );
    }else if (service == 'tumblr' && config.get('tumblr_xauth')){
        dialog('tumblr-xauth/');
        //url = '#/tumblr-xauth/?redirect='+ escape( next );
        //Backbone.history.navigate( url );
    }else{
        if (local_storage.get( "appmode" )){
            if (local_storage.get("appmode") == 'iphone'){
                // double encode for iphone - the iOS code should be changed to handle it
                // without this so this can be removed in future
                url = config.get('api_base') + "/linked_services/"+ service +
                    "/oauth/?display=touch&access_token=" + auth.get("access_token") +
                    "&redirect=" + escape("snapr://redirect?redirect_url=" + escape( next ));
            }else if(local_storage.get("appmode") == 'android'){
                // android needs a snapr://link?url=
                url = "snapr://link?url=" + config.get('api_base') +
                    "/linked_services/"+ service + "/oauth/?display=touch&access_token=" +
                    auth.get("access_token") + "&redirect=snapr://redirect?redirect_url=" +
                    escape( next );
            }else{
                // non-ios builds should be made to handle the redirect param escaped property so
                // this can be changed to escape("snapr://redirect?redirect_url=" + escape( window.location.href ))
                url = config.get('api_base') + "/linked_services/"+ service + "/oauth/?display=touch&access_token=" +
                    auth.get("access_token") +
                    "&redirect=snapr://redirect?redirect_url=" + escape( next );
            }
        }else{
            url = config.get('api_base') + "/linked_services/" + service +
                "/oauth/?display=touch&access_token=" + auth.get("access_token") +
                "&redirect=" + escape( next );
        }
        window.location = url;
    }
};
});
