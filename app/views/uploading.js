/*global _  define require */
define(['backbone', 'views/base/page', 'views/upload_progress_li', 'collections/upload_progress',
    'models/photo', 'models/comp', 'views/base/side_scroll', 'collections/photo', 'utils/local_storage', 'utils/alerts', 'native_bridge', 'config', 'views/components/paused'],
function(Backbone, page_view, upload_progress_li, upload_progress, photo_model, comp_model, side_scroll, photo_collection, local_storage, alerts, native_bridge, config, paused_el){

var uploading = page_view.extend({

    post_initialize: function(){
        this.comp_template = this.get_template('components/uploading/comp');

        var view = this;
        this.$el.on( "pageshow", function(){
            view.watch_uploads();
        });
        this.$el.on( "pagehide", function(){
            view.watch_uploads(false);
        });
        config.on('change:paused', function(){
            if(config.get('paused')){
                view.$('.x-progress-header').prepend(paused_el).trigger("create");
            }else{
                $('.x-resume-queue').remove();
            }
        });
        upload_progress.on('all', this.upload_count());
    },

    post_activate: function(options){
        this.change_page();

        //reset photo to latest one in progress object
        // calls to upload_porgress will set this
        this.progress_view = null;

        this.query = options.query;

        if(this.query.comp_id){
            this.comp = new comp_model({id: this.query.comp_id});
            this.comp.fetch();
        }

        if (this.query.ll){
            var ll = this.query.ll.split(",");
            this.latitude = ll[0];
            this.longitude = ll[1];
        }
        this.foursquare_venue = this.query.spot;
        this.venue_name = this.query.venue_name;

        this.progress_el = this.$( ".x-progress-header" ).empty();

        if (this.query.photo_id){
            // web flow - photo is uploaded then user is sent here
            // so the id and photo on the server are available
            this.upload_complete(this.query.photo_id);
        }else{
            // no photo_id = in appmode the photo is probably being uploaded by the native_bridge
            // app in the background, we can show progress here.
            this.render_streams();
        }
        this.update_uploads();
    },

    events: {
        "click .x-cancel-upload": "cancel_upload"
    },

    get_override_tab: function(){ return 'share'; },

    render_streams: function(){
        var $image_stream_container = this.$( ".x-image-streams" ).empty();

        // not in offline mode
        if(config.get('offline')){
            this.offline(true);
            return;
        }

        if(this.comp){
            this.insert_comp_streams();
        }else{
            var location_available = this.latitude && this.longitude && parseFloat(this.latitude, 10) && parseFloat(this.longitude, 10);

            if (this.foursquare_venue){
                this.insert_venue_streams();
            }else if(location_available){
                this.insert_location_streams();
            }
        }

        $image_stream_container.trigger('create');

    },

    insert_comp_streams: function(){
        var $image_stream_container = this.$( ".x-image-streams" );

        var comp_stream = new side_scroll({
            data: {
                comp_id: this.comp.id,
                sort: 'weighted_score'
            },
            expand: true,
            title: 'popular entries',
            parent_view: this,
            use_gallery: false
        });

        $image_stream_container.append( comp_stream.el );
        comp_stream.render();

        $image_stream_container.append( this.comp_template(this.comp.attributes) );
    },


    insert_venue_streams: function(){
        var $image_stream_container = this.$( ".x-image-streams" );

        var venue_stream = new side_scroll({
            collection: new photo_collection([], {data: {
                foursquare_venue: this.foursquare_venue
            }}),
            expand: true,
            title: '@ ' + this.venue_name,
            use_gallery: false,
            parent_view: this
        });

        $image_stream_container.append( venue_stream.el );
        venue_stream.render();
    },

    insert_location_streams: function(){
        var $image_stream_container = this.$( ".x-image-streams" );

        var location_stream = new side_scroll({
            data: {
                latitude: this.latitude,
                longitude: this.longitude,
                radius: config.get('nearby_radius')
            },
            expand: true,
            title: 'nearby',
            parent_view: this,
            use_gallery: false,
            no_photos: function(){

                this.collection.data.radius = this.collection.data.radius + config.get('nearby_radius');
                this.fetch();

                return true;
            }
        });

        $image_stream_container.append( location_stream.el );
        location_stream.render();
    },

    cancel_upload: function(){
        if (this.current_upload && this.current_upload.id){
            var current_upload = this.current_upload;
            var appmode = local_storage.get("appmode");

            alerts.approve({
                "title": "Cancel this upload?",
                "yes_callback": function(){
                    if (appmode){
                        native_bridge.pass_data("snapr://upload?cancel=" + current_upload.id);
                    }else{
                        Backbone.history.navigate( "#/upload/" );
                    }
                }
            });

        }else{
            Backbone.history.navigate( "#" );
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
        if(this.progress_view){ return; }

        // our photo must be the last one in the queue
        var photo,
            local_id = this.query.local_id;
        upload_progress.any(function(upload){
            if(upload.get('local_id') == local_id){
                photo = upload;
                return true;
            }
        });

        // if there's no photo yet we probably haven't recieved an upload_progress call
        // native code, when we do this function will get called again
        if(!photo){ return; }

        this.progress_view = new upload_progress_li({
            photo: photo,
            venue_name: this.venue_name,
            update_on_complete: true
        });
        this.progress_view.canceled_upload = function(){
            this.photo.set('upload_status', 'canceled');
        };
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

                uploading_view.render_streams();
            }
        });
    },

    upload_cancelled: function( queue_id ){
        if (this.progress_el){
            this.progress_el.remove();
            delete this.progress_el;
        }
    },

    upload_count: function(){
        if (upload_progress.length){
            this.$el.addClass(".x-showing-upload-queue");
        }else{
            this.$el.removeClass(".x-showing-upload-queue");
        }
    },

    offline: function(offline_mode){
        if (this.progress_view){
            this.progress_view.queued(true);
        }
        this.$('.x-offline').show();
    }
});

return uploading;

});
