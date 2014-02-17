define(['views/uploading'], function(uploading_view){
    return uploading_view.extend({

        upload_complete: function(photo_id, data){
            data = data || {};
            this.$('.offline').hide();

            $('.email').attr('href', 'mailto:?subject=Check Out This Junk&body=http://test.artjunk.org/' + photo_id);
            $('.email').show();

            if(data.to_link && data.to_link.length){
                // if there are services to link we won't be doing anything here.
                return;
            }

            if(config.get('post_upload_redirect')){
                var url = config.get('post_upload_redirect');
                url += url.indexOf('?') == -1 ? '?' : '&';
                url += 'photo_id=' + photo_id;
                url += '&source=server';
                if(this.query.comp_id){
                    url += '&comp_id=' + this.query.comp_id;
                }
                window.location = url;
                return;
            }

            var photo = new photo_model({id:photo_id});
            var uploading_view = this;
            photo.fetch({
                success: function(){
                    photo.set('upload_status', 'completed');
                    photo.set('thumbnail', "https://s3.amazonaws.com/media-server2.snapr.us/thm2/" +
                        photo.get("secret") + "/" +
                        photo.get("id") + ".jpg");

                    uploading_view.progress_view = new upload_progress_li({
                        photo: photo
                    });
                    uploading_view.progress_el.html( uploading_view.progress_view.render().el );
                }
            });
        }
    });

});