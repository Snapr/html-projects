/*global _  define require */
define(['config', 'libs/jpegmeta'], function(config, JpegMeta){

function dms_to_decimal(exif){
    var degrees = exif.value[0].asFloat();
    var minutes = exif.value[1].asFloat() / 60;
    var seconds = exif.value[2].asFloat() / 3600;
    return degrees + minutes + seconds;
}

$(function(){
    $('<input type="file" id="x-web-upload" style="display:none">')
        .appendTo(document.body)
        .on('change', function(e){
            var files = $('#x-web-upload').get(0).files;
            if(!files.length){
                return;
            }
            var file = files[0];
            var exif_reader = new FileReader();

            exif_reader.onloadend = function(){
                var exif = new JpegMeta.JpegFile(this.result, this.file.name);
                var data = {
                    latitude: exif.gps && exif.gps.latitude && exif.gps.latitude.value,
                    longitude: exif.gps && exif.gps.longitude && exif.gps.longitude.value,
                    date: exif.exif && exif.exif.DateTimeOriginal && exif.exif.DateTimeOriginal.value
                };
                window.location.hash = '#/share/?'+$.param(data);
            };
            exif_reader.file = file;
            exif_reader.readAsBinaryString(file);


        });
});


return function(upload_params){

    var uploads = [];
    upload_params.upload_status = "active";
    upload_params.percent_complete = 0;
    uploads.push(upload_params);

    var this_view = this,
        local_id = upload_params.local_id,
        file = $('#x-web-upload').get(0).files[0],
        xhr = new XMLHttpRequest();

    xhr.upload.onprogress = function(rpe) {
        var percent = Math.ceil(rpe.loaded*100 / rpe.total);
        uploads[0].percent_complete = percent;
        window.upload_progress({uploads:uploads});
        if(percent == 100){
            uploads[0].upload_status = 'finishing';
        }

    };
    xhr.onload = function(event){
        var data = JSON.parse(event.target.responseText);
        uploads[0].upload_status = 'completed';
        window.upload_progress({uploads:uploads});
        console.log(data);
        window.upload_completed(local_id, data.response.photo.id);
    };
    xhr.onerror = function(a){
        window.upload_failed(local_id, a);
    };

    xhr.open('post', config.get('base_url') + "/api/upload/", true);
    xhr.setRequestHeader("Cache-Control", "no-cache");
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader("X-File-Name", file.name);
    xhr.setRequestHeader("X-File-Size", file.size);

    var f = new FormData();
    f.append('photo', file);
    $.each(upload_params, function(k,v){
        if(!_.contains(['thumbnail'], k)){
            f.append(k,v);
        }
    });
    xhr.send(f);
};

});
