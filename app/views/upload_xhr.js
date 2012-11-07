/*global _  define require */
define(['config', 'views/base/page', 'auth', 'utils/string'], function(config, page_view, auth, string_utils){
return page_view.extend({

    post_initialize: function(){
    },

    post_activate: function(){
        // we will redirect to this url on successful upload
        this.redirect_uri = window.location.origin + window.location.pathname + "#/share/";

        this.change_page();
    },

    events: {
        "change .x-file": "enable_upload_submit",
        "submit form": "upload"
    },

    enable_upload_submit: function( e ){
        this.$("form input[type='submit']").button( $(e.target).val() ? "enable": "disable" );
    },

    build_data: function(){
        var data = {
            'access_token': auth.get('access_token')
        };

        var d = new Date();
        data.device_time = (
            d.getFullYear() + '-' +
            string_utils.zeroFill( ( d.getMonth() + 1 ), 2 ) + '-' +
            string_utils.zeroFill( d.getDate(), 2 ) + ' ' +
            string_utils.zeroFill( d.getHours(), 2 ) + ':' +
            string_utils.zeroFill( d.getMinutes(), 2 ) + ':' +
            string_utils.zeroFill( d.getSeconds(), 2 )
        );

        if(config.get('app_group')){
            data.app_group = config.get('app_group');
        }

        return data;
    },

    update_progress: function(percent){
        this.$('.x-progress-bar').css({'width': percent + '%'});
    },

    update_status: function(status){
        this.$('.x-upload-status').text(status);
    },

    upload: function(){
        $.mobile.loadingMessage = "Uploading…";
        $.mobile.showPageLoadingMsg();
        this.update_status('starting');

        var data = this.build_data(),
            this_view = this,
            file = this.$('.x-file')[0].files[0],
            xhr = new XMLHttpRequest();

        xhr.upload.onprogress = function(rpe) {
            var percent = Math.ceil(rpe.loaded*100 / rpe.total);
            this_view.update_progress(percent);
            if(percent == 100){
                this_view.update_status('processing');
            }else{
                this_view.update_status('uploading');
            }

        };
        xhr.onload = function(event){
            this_view.upload_complete(JSON.parse(event.target.responseText));
        };
        xhr.onerror = function(a){
            this_view.update_status('error');
        };

        xhr.open('post', config.get('base_url') + "/api/upload/", true);
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("X-File-Name", file.name);
        xhr.setRequestHeader("X-File-Size", file.size);

        var f = new FormData();
        f.append('photo', file);
        $.each(data, function(k,v){
            f.append(k,v);
        });
        xhr.send(f);
    },

    upload_complete: function(response){
        this.update_status('complete');
        window.location = "#/share/?photo_id=" + response.response.photo.id;
    }


});

});
