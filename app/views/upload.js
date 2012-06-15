/*global _  define require */
define(['views/base/page', 'auth', 'utils/string'], function(page_view, auth, string_utils){
return page_view.extend({

    post_initialize: function(){
        this.$el.find("form").attr( "action", snapr.base_url + "/api/upload/" );
    },

    post_activate: function(){
        // we will redirect to this url on successful upload
        this.redirect_uri = window.location.origin + window.location.pathname + "#/photo-edit/";

        this.change_page();
    },

    events: {
        "change #upload-file": "enable_upload_submit",
        "submit #upload-form": "show_uploading_dialog"
    },

    enable_upload_submit: function( e ){
        $("#upload-form input[type='submit']").button( $(e.target).val() ? "enable": "disable" );
        this.set_hidden_fields();
    },

    set_hidden_fields: function(){
        var d = new Date();
        $("#device-time").val(
            d.getFullYear() + '-' +
            string_utils.zeroFill( ( d.getMonth() + 1 ), 2 ) + '-' +
            string_utils.zeroFill( d.getDate(), 2 ) + ' ' +
            string_utils.zeroFill( d.getHours(), 2 ) + ':' +
            string_utils.zeroFill( d.getMinutes(), 2 ) + ':' +
            string_utils.zeroFill( d.getSeconds(), 2 )
        );
        $("#redirect_uri").val( this.redirect_uri );
        $("#_access_token").attr("name", "access_token").val( auth.get("access_token") );
    },

    show_uploading_dialog: function(){
        $.mobile.loadingMessage = "Uploading…";
        $.mobile.showPageLoadingMsg();
    }


});

});
