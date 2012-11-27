/*global _  define require */
define(['views/base/page', 'native_bridge', 'auth', 'utils/local_storage'], function(page_view, native_bridge, auth, local_storage){

    function logout(){
        auth.logout();

        window.location.hash = "";
        if (local_storage.get( "appmode" )){
            native_bridge.pass_data('snapr://logout');
        }
    }

    return page_view.extend({
        initialize: logout,
        activate: logout
    });
});
