/*global _, define, require */
define(['backbone', 'views/base/page', 'views/components/upload_progress', 'collections/upload_progress',
    'models/photo', 'models/comp', 'collections/photo', 'utils/local_storage', 'utils/alerts', 'native_bridge', 'config', 'views/components/paused', 'views/components/feed'],
function(Backbone, page_view, upload_progress_li, upload_progress, photo_model, comp_model, photo_collection, local_storage, alerts, native_bridge, config, paused_el, feed){

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
                view.$('.x-progress-header').prepend(paused_el).trigger("create");
            }else{
                $('.x-resume-queue').remove();
            }
        });
        upload_progress.on('all', this.upload_count());
    },

    post_activate: function(options){  var self = this;
        this.change_page();
        //reset photo to latest one in progress object
        // calls to upload_porgress will set this
        this.progress_view = null;

        this.query = options.query;

        if(this.query.comp_id){
            this.comp = new comp_model({id: this.query.comp_id});
            //this.comp.deferred = $.Deferred();
            //var comp = this.comp;
            this.comp.fetch({success:function(){
                //comp.deferred.resolve();
                self.replace_from_template({comp:self.comp}, ['.x-comp']).enhanceWithin();
            }});
        }else{
            this.comp = null;
            self.$('.x-comp').empty();
        }

        if (this.query.ll){
            var ll = this.query.ll.split(",");
            this.latitude = ll[0];
            this.longitude = ll[1];
        }
        if(this.query.latitude && this.query.longitude){
            this.latitude = this.query.latitude;
            this.longitude = this.query.longitude;
        }
        this.foursquare_venue = this.query.spot || this.query.foursquare_venue || this.query.foursquare_venue_id;
        this.venue_name = this.query.venue_name && this.query.venue_name.replace(/\+/g, ' ');

        this.progress_el = this.$( ".x-progress-header" ).empty();

        if (this.query.photo && !local_storage.get("appmode")){
            // web flow - photo is uploaded then user is sent here
            // so the id and photo on the server are available
            this.upload_complete(this.query.photo);
        }else if(this.query.photo_id){
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

    get_override_tab: function(){ return 'uploading'; },

    render_streams: function(){

        // not in offline mode
        if(config.get('offline')){
            this.offline(true);
            return;
        }

        var tabs = [];
        if(this.comp){
            tabs.push({
                title: 'Popular Entries',
                query: {
                    comp: this.comp.id,
                    sort: 'weighted_score',
                    min_rating: 0
                },
                list_style: 'grid'
            });
        }else{
            var location_available = this.latitude && this.longitude && parseFloat(this.latitude, 10) && parseFloat(this.longitude, 10);
            if (this.foursquare_venue){
                tabs.push({
                    title: this.venue_name,
                    query: { foursquare_venue: this.foursquare_venue },
                    list_style: 'grid'
                });
            }else if(location_available){
                tabs.push({
                    title: 'Nearby',
                    query: {
                        latitude: this.latitude,
                        longitude: this.longitude,
                        radius: config.get('nearby_radius')
                    },
                    list_style: 'grid'
                });
            }
        }

        if(!tabs.length){
            tabs = [{
                title:'Latest',
                query:{},
                list_style: 'grid'
            }];
        }

        this.photos = new feed({
            el: this.$(".x-photo-streams"),
            tabs: tabs,
            show_tabs: true
        });

    },

    cancel_upload: function(){
        if (this.progress_view && this.progress_view.photo && this.progress_view.photo.id){
            var current_upload = this.progress_view.photo;
            var appmode = local_storage.get("appmode");

            alerts.approve({
                "title": "Cancel this upload?",
                "yes_callback": function(){
                    if (appmode){
                        native_bridge.pass_data("snapr://upload?cancel=" + current_upload.id);
                    }else{
                        window.location.href="#/upload/";
                    }
                },
                'no': 'No'
            });

        }else{
            window.location.href="#/";
        }

    },

    upload_canceled: function(){
        window.location.href="#/";
    },

    watch_uploads: function(on){
        if(on !== false){
            upload_progress.on('add', _.bind(this.update_uploads, this));
        }else{
            upload_progress.off('add', _.bind(this.update_uploads, this));
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

        var this_view = this;
        photo.on('complete', function(model, data){this_view.upload_complete(photo.id, data);});
        photo.on('cancel', function(model, data){this_view.upload_canceled();});

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
    },

    upload_count: function(){
        if (upload_progress.length){
            this.$el.addClass(".x-showing-upload-queue");
        }else{
            this.$el.removeClass(".x-showing-upload-queue");
        }
    }
});

return uploading;

});
