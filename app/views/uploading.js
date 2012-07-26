/*global _  define require */
define(['backbone', 'views/base/page', 'views/upload_progress_li', 'collections/upload_progress',
    'models/photo', 'views/base/side_scroll', 'collections/photo', 'utils/local_storage', 'utils/alerts', 'native', 'config', 'views/components/paused'],
function(Backbone, page_view, upload_progress_li, upload_progress, photo_model, side_scroll, photo_collection, local_storage, alerts, native, config, paused_el){

var uploading = page_view.extend({

    post_initialize: function(){
        var view = this;
        this.$el.on( "pageshow", function(){
            view.watch_uploads();
        });
        this.$el.on( "pagehide", function(){
            view.watch_uploads(false);
        });
        config.on('change:paused', function(){
            if(config.get('paused')){
                view.$('.upload-progress-header').prepend(paused_el).trigger("create");
            }else{
                $('.x-resume-queue').remove();
            }
        });
    },

    post_activate: function(options){
        this.change_page();

        //reset photo to latest one in progress object
        // calls to upload_porgress will set this
        this.progress_view = null;

        this.query = options.query;

        if (this.query.ll){
            var ll = this.query.ll.split(",");
            this.latitude = ll[0];
            this.longitude = ll[1];
        }
        this.foursquare_venue = this.query.spot;
        this.venue_name = this.query.venue_name;

        this.progress_el = this.$( ".upload-progress-container" ).empty();

        if (this.query.photo_id){
            // web flow - photo is uploaded then user is sent here
            // so the id and photo on the server are available
            this.upload_complete(this.query.photo_id);
        }else{
            // no photo_id = in appmode the photo is probably being uploaded by the native
            // app in the background, we can show progress here.
            this.render();
        }
        //this.update_uploads();
    },

    events: {
        "click .x-cancel-upload": "cancel_upload"
    },

    render: function(){
        var $image_stream_container = this.$( ".image-streams" ).empty();

        if (this.foursquare_venue){
            this.recent_nearby_stream = new uploading_image_stream({
                stream_type: "spot",
                foursquare_venue: this.foursquare_venue,
                venue_name: this.venue_name
            });
        }else{
            if (this.latitude && this.longitude && parseFloat(this.latitude, 10) && parseFloat(this.longitude, 10)){
                this.recent_nearby_stream = new uploading_image_stream({
                    stream_type: "recent-nearby",
                    latitude: this.latitude,
                    longitude: this.longitude
                });
            }
        }

        if (this.latitude && this.longitude && parseFloat(this.latitude, 10) && parseFloat(this.longitude, 10)){
            this.popular_nearby_stream = new uploading_image_stream({
                stream_type: "popular-nearby",
                latitude: this.latitude,
                longitude: this.longitude
                //container: $image_stream_container
            });
        }

        if (this.recent_nearby_stream){
            var recent_nearby_stream = this.recent_nearby_stream;
            recent_nearby_stream.collection.fetch({
                data:{n:6},
                success: function(){
                    $image_stream_container.append( recent_nearby_stream.el );
                    recent_nearby_stream.render();
                    recent_nearby_stream.$el.trigger( "create" );
                }
            });
        }

        if (this.popular_nearby_stream){
            var popular_nearby_stream = this.popular_nearby_stream;
            popular_nearby_stream.collection.fetch({
                data:{n:6},
                success: function(){
                    $image_stream_container.append( popular_nearby_stream.el );
                    popular_nearby_stream.render();
                    popular_nearby_stream.$el.trigger( "create" );
                }
            });
        }

        if(!this.recent_nearby_stream && !this.popular_nearby_stream){
            $image_stream_container.append( $("#uploading-stream-placeholder-template").html() ).trigger('create');
        }

    },

    cancel_upload: function(){
        if (this.current_upload && this.current_upload.id){
            var current_upload = this.current_upload;
            var appmode = local_storage.get("appmode");

            alerts.approve({
                "title": "Cancel this upload?",
                "yes_callback": function(){
                    if (appmode){
                        native.pass_data("snapr://upload?cancel=" + current_upload.id);
                    }else{
                        Backbone.history.navigate( "#/upload/" );
                    }
                }
            });

        }else{
            Backbone.history.navigate( "#/" );
        }

    },

    watch_uploads: function(on){
        if(on !== false){
            upload_progress.on('add', this.update_uploads);
        }else{
            upload_progress.off('add', this.update_uploads);
        }
    },

    update_uploads: function(model, changes){
        this.$('.offline').hide();
        if(this.progress_view){ return; }

        // our photo must be the last one in the queue
        var photo = upload_progress.at(upload_progress.length-1);

        // if there's no photo yet we probably haven't recieved an upload_progress call
        // native code, when we do this function will get called again
        if(!photo){ return; }

        this.progress_view = new upload_progress_li({
            photo: photo,
            venue_name: this.venue_name,
            update_on_complete: true
        });
        this.progress_el.html( this.progress_view.render().el );
    },

    upload_complete: function(photo_id){
        this.$('.offline').hide();

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

                if(photo.get('location').foursquare_venue_id){
                    uploading_view.foursquare_venue = photo.get('location').foursquare_venue_id;
                    uploading_view.venue_name = photo.get('location').foursquare_venue_name;
                }

                uploading_view.render();
            }
        });
    },

    upload_cancelled: function( queue_id ){
        if (this.progress_el){
            this.progress_el.remove();
            delete this.progress_el;
        }
    },

    upload_count: function( count ){
        if (count){
            this.$el.addClass("showing-upload-queue");
        }else{
            this.$el.removeClass("showing-upload-queue");
        }
    },

    offline: function(offline_mode){
        if (this.progress_view){
            this.progress_view.queued(true);
        }
        this.$('.offline').show();
    }
});

var uploading_image_stream = side_scroll.extend({
    tagName: 'li',
    className: 'image-stream',
    template: _.template( $('#uploading-stream-template').html() ),
    thumbs_template: _.template( $('#uploading-stream-thumb-template').html() ),

    post_initialize: function(){

        this.details = {
            stream_type: this.options.stream_type,
            latitude: this.options.latitude,
            longitude: this.options.longitude,
            foursquare_venue: this.options.foursquare_venue,
            venue_name: this.options.venue_name
        };

        switch (this.details.stream_type){
            case "popular-nearby":
                this.collection.data = {
                    latitude: this.details.latitude,
                    longitude: this.details.longitude,
                    radius: 5000,
                    sort: "favorite_count"
                };
                break;
            case "recent-nearby":
                this.collection.data = {
                    latitude: this.details.latitude,
                    longitude: this.details.longitude,
                    radius: 5000
                };
                break;
            case "spot":
                this.collection.data = {
                    foursquare_venue: this.details.foursquare_venue
                };
                break;
        }
        this.collection.data.n = config.get('side_scroll_initial');

    }
});

return uploading;

});
