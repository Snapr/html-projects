/*global _  define require */
define(['backbone', 'utils/local_storage', 'utils/alerts', 'native'], function(Backbone, local_storage, alerts, native){
return Backbone.View.extend({

    tagName: "li",

    className: "upload-progress-item",

    initialize: function(options){
        this.template = this.options.template || _.template( $("#upload-progress-li-template").html() );

        this.photo = options.photo;
        this.message = null;
        this.photo_id = null;
        this.venue_name = options.venue_name;
    },

    events: {
        "click .x-cancel-upload": "cancel_upload"
    },

    render: function(){
        // check that the progress hasn't already reached 100%
        if (!this.$(".finishing").length){
            this.$el.addClass("upload-id-" + this.photo.id);
            this.$el.html(
                this.template({
                    upload_status: this.is_queued ? 'queued' : this.photo.get('upload_status').toLowerCase(),
                    description: unescape( this.photo.get('description') ),
                    venue: this.photo.get('location').foursquare_venue_name || this.venue_name || this.photo.get('location').location,
                    spot_id: this.photo.get('location').spot_id,
                    shared: this.photo.get('shared'),
                    facebook_sharing: (
                        this.photo.get('shared') && this.photo.get('shared').facebook_album ||
                        this.photo.get('shared') && this.photo.get('shared').facebook_newsfeed ||
                        this.photo.get('sharing') && this.photo.get('sharing').facebook_album ||
                        this.photo.get('sharing') && this.photo.get('sharing').facebook_newsfeed
                    ),
                    twitter_sharing: (
                        this.photo.get('shared') && this.photo.get('shared').tweeted ||
                        this.photo.get('sharing') && this.photo.get('sharing').tweeted
                        ),
                    foursquare_sharing: (
                        this.photo.get('shared') && this.photo.get('shared').foursquare_checkin ||
                        this.photo.get('sharing') && this.photo.get('sharing').foursquare_checkin
                    ),
                    tumblr_sharing: (
                        this.photo.get('shared') && this.photo.get('shared').tumblr ||
                        this.photo.get('sharing') && this.photo.get('sharing').tumblr
                    ),
                    thumbnail: this.photo.get('thumbnail'),
                    percent_complete: this.photo.get('percent_complete'),
                    message: this.message,
                    photo_id: this.photo.get('id'),
                    username: this.photo.get('username')
                })
            ).trigger( "create" );
        }

        return this;
    },

    queued: function(is_queued){
        this.is_queued = is_queued;
        //this.render();
    },

    cancel_upload: function(){
        var id = this.photo.id;
        var li_view = this;
        alerts.approve({
            "title": "Cancel this upload?",
            "yes_callback": function(){
                if (local_storage.get( "appmode" )){
                    native.pass_data( "snapr://upload?cancel=" + id );
                }
                li_view.remove();
            }
        });
    }

});
});
