/*global _ Route define require */
define(['views/base/page', 'views/uploading_image_stream', 'views/upload_progress_li', 'models/photo'], function(page_view, uploading_image_stream, upload_progress_li, photo_model){
return  page_view.extend({
    post_initialize: function(){

        this.change_page();

        this.current_upload = null;
        this.pending_uploads = {};

        this.query = this.options.query;

        if (this.query.ll){
            this.latitude = this.query.ll.split(",")[0];
            this.longitude = this.query.ll.split(",")[1];
        }
        this.spot = this.query.spot;
        this.venue_name = this.query.venue_name;
        this.photo_id = this.query.photo_id;

        this.$el.removeClass("showing-upload-queue");
        this.$el.find( ".upload-progress-container" ).empty();
        this.render();

        if (this.photo_id){
            this.upload_completed( 0, this.photo_id);
        }
        else{
            // testing upload stuff
            //var test_data = {"uploads":[{"description":"Pzzz","percent_complete":10,"id":"013FBD4D-7","sharing":{},"date":"2012-03-09 14:25:59 -0500","status":"private","location":{},"shared":{tweeted:true},"upload_status":"Active","thumbnail":"file:///Users/dpwolf/Library/Application Support/iPhone Simulator/5.0/Applications/ECF32C66-12DE-44D8-B2C2-9A02A0DD77BE/Documents/upload/00000000000353013969.jpg"}]}
        }
    },

    events: {
        "click .x-cancel-upload": "cancel_upload"
    },

    render: function()
    {
        var $image_stream_container = this.$el.find( ".image-streams" ).empty();

        if (this.spot){
            this.recent_nearby_stream = new uploading_image_stream({
                stream_type: "spot",
                spot: this.spot,
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
                longitude: this.longitude,
                container: $image_stream_container
            });
        }

        if (this.recent_nearby_stream){
            var recent_nearby_stream = this.recent_nearby_stream;
            recent_nearby_stream.collection.fetch({
                data:{n:6},
                success: function(){
                    $image_stream_container .append( recent_nearby_stream.el );
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
                    $image_stream_container .append( popular_nearby_stream.el );
                    popular_nearby_stream.render();
                    popular_nearby_stream.$el.trigger( "create" );
                }
            });
        }

        if(!this.recent_nearby_stream && !this.popular_nearby_stream){
            $image_stream_container.append( $("#uploading-stream-placeholder-template").html() ).trigger('create');
        }

    },

    cancel_upload: function()
    {
        if (this.current_upload && this.current_upload.id){
            var current_upload = this.current_upload;
            var appmode = snapr.utils.get_local_param("appmode");

            snapr.utils.approve({
                "title": "Cancel this upload?",
                "yes_callback": function(){
                    if (appmode)
                    {
                        pass_data("snapr://upload?cancel=" + current_upload.id);
                    }
                    else
                    {
                        Route.navigate( "#/upload/" );
                    }
                }
            });

        }else{
            console.log("current_upload not set when trying to cancel upload");
            Route.navigate( "#/" );
        }

    },

    upload_progress: function( upload_data )
    {
        console.warn( 'upload_progress: ', JSON.stringify( upload_data ) );

        var $container = this.$el.find(".upload-progress-container");

        _.each( upload_data.uploads, function( photo, index ){
            // console.log("photo: ", photo, " index: ", index)
            if ((photo.upload_status.toLowerCase() == "active") && (!this.current_upload || this.current_upload.id == photo.id))
            {
                if (!this.pending_uploads[photo.id])
                {
                    this.pending_uploads[photo.id] = new upload_progress_li({
                        photo: photo
                    });
                    $container.html( this.pending_uploads[photo.id].render().el );
                }
                else
                {
                    this.pending_uploads[photo.id].photo = photo;
                    this.pending_uploads[photo.id].render();
                }
                this.current_upload = photo;
            }

        }, this );

        if (upload_data.uploads){
            this.$el.addClass("showing-upload-queue");
        }

    },

    upload_completed: function( queue_id, snapr_id )
    {
        var $container = this.$el.find(".upload-progress-container");

        var uploading_view = this;

        // add the upload progress li at the top
        if (!this.pending_uploads[queue_id]){
            var photo = new photo_model({id: snapr_id});

            photo.fetch({
                success: function( photo )
                {
                    var progress_li = new upload_progress_li({
                        photo: photo.attributes
                    });
                    progress_li.message = "Completed!";
                    progress_li.photo.upload_status = "completed";
                    progress_li.post_id = snapr_id;
                    progress_li.photo.thumbnail = "https://s3.amazonaws.com/media-server2.snapr.us/thm2/" +
                        photo.get("secret") + "/" +
                        snapr_id + ".jpg";
                    $container.html( progress_li.render().el );
                    uploading_view.latitude = photo.has("location") && photo.get("location").latitude;
                    uploading_view.longitude = photo.has("location") && photo.get("location").longitude;
                    uploading_view.spot = photo.has("location") && photo.get("location").spot_id;
                    uploading_view.venue_name = photo.has("location") && photo.get("location").foursquare_venue_name;
                    uploading_view.render();
                }
            });
        }else{
            this.pending_uploads[queue_id].message = "Completed!";
            this.pending_uploads[queue_id].photo.upload_status = "completed";
            this.pending_uploads[queue_id].post_id = snapr_id;
            this.pending_uploads[queue_id].render();
        }
    },

    upload_cancelled: function( queue_id )
    {
        if (this.pending_uploads[queue_id]){
            this.pending_uploads[queue_id].remove();
            delete this.pending_uploads[queue_id];
        }
        // Route.navigate( "#/" );
    },

    upload_count: function( count )
    {
        if (count){
            this.$el.addClass("showing-upload-queue");
        }else{
            this.$el.removeClass("showing-upload-queue");
        }
    }
});

});
