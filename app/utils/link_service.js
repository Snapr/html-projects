/*global _ Route define require */
define(['utils/local_storage'], function(local_storage){
return function(service, next){
    var url;
    if (service == 'twitter' && snapr.twitter_xauth){
        url = '#/twitter-xauth/?redirect='+ escape( next );
        Route.navigate( url );
    }else if (service == 'tumblr' && snapr.tumblr_xauth){
        url = '#/tumblr-xauth/?redirect='+ escape( next );
        Route.navigate( url );
    }else{
        if (local_storage.get( "appmode" )){
            if (local_storage.get("appmode") == 'iphone'){
                // double encode for iphone - the iOS code should be changed to handle it
                // without this so this can be removed in future
                url = snapr.api_base + "/linked_services/"+ service +
                    "/oauth/?display=touch&access_token=" + auth.get("access_token") +
                    "&double_encode=true&redirect=" + escape("snapr://redirect?url=" + escape( next ));
            }else if(local_storage.get("appmode") == 'android'){
                // android needs a snapr://link?url=
                url = "snapr://link?url=" + snapr.api_base +
                    "/linked_services/"+ service + "/oauth/?display=touch&access_token=" +
                    auth.get("access_token") + "&redirect=snapr://redirect?url=" +
                    escape( next );
            }else{
                // non-ios builds should be made to handle the redirect param escaped property so
                // this can be changed to escape("snapr://redirect?url=" + escape( window.location.href ))
                url = snapr.api_base + "/linked_services/"+ service + "/oauth/?display=touch&access_token=" +
                    auth.get("access_token") +
                    "&redirect=snapr://redirect?url=" + escape( next );
            }
        }else{
            url = snapr.api_base + "/linked_services/" + service +
                "/oauth/?display=touch&access_token=" + auth.get("access_token") +
                "&redirect=" + escape( next );
        }
        window.location = url;
    }
};
});
