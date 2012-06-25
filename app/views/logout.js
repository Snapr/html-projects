/*global _  define require */
define(['views/base/page', 'native', 'auth', 'utils/local_storage'], function(page_view, native, auth, local_storage){

    function logout(){
        auth.logout();

        window.location.hash = "";
        if (local_storage.get( "appmode" )){
            native.pass_data('snapr://logout');
        }
    }

    return page_view.extend({
        initialize: logout,
        activate: logout
    });
});
