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
    },

    events: {
        "click .x-cancel-upload": "cancel_upload"
    },

    render: function(){
        // check that the progress hasn't already reached 100%
        if (!this.$el.find(".finishing").length){
            this.$el.addClass("upload-id-" + this.photo.id);
            this.$el.html(
                this.template({
                    upload_status: this.photo.upload_status.toLowerCase(),
                    description: unescape( this.photo.description ),
                    venue: this.photo.location.foursquare_venue_name || this.photo.location.location,
                    spot_id: this.photo.location.spot_id,
                    shared: this.photo.shared,
                    facebook_sharing: (
                        this.photo.shared && this.photo.shared.facebook_album ||
                        this.photo.shared && this.photo.shared.facebook_newsfeed ||
                        this.photo.sharing && this.photo.sharing.facebook_album ||
                        this.photo.sharing && this.photo.sharing.facebook_newsfeed
                    ),
                    twitter_sharing: (
                        this.photo.shared && this.photo.shared.tweeted ||
                        this.photo.sharing && this.photo.sharing.tweeted
                        ),
                    foursquare_sharing: (
                        this.photo.shared && this.photo.shared.foursquare_checkin ||
                        this.photo.sharing && this.photo.sharing.foursquare_checkin
                    ),
                    tumblr_sharing: (
                        this.photo.shared && this.photo.shared.tumblr ||
                        this.photo.sharing && this.photo.sharing.tumblr
                    ),
                    thumbnail: this.photo.thumbnail,
                    percent_complete: this.photo.percent_complete,
                    message: this.message,
                    photo_id: this.photo.id
                })
            ).trigger( "create" );
        }

        return this;
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
