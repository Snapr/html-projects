snapr.views.upload_progress_li = Backbone.View.extend({

    tagName: "div",

    className: "upload-progress-header page-inset-header",

    initialize: function()
    {
        this.template = this.options.template || _.template( $("#upload-progress-li-template").html() );
        this.photo = this.options.photo;
        this.message = null;
        this.photo_id = null;
    },

    events: {
        "click .cancel": "cancel_upload"
    },

    render: function()
    {
        // console.log("li", this)
        // check that the progress hasn't already reached 100%
        if (!this.$el.find(".finishing").length)
        {
            this.$el.html(
                this.template({
                    upload_status: this.photo.upload_status.toLowerCase(),
                    description: this.photo.description,
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
                    photo_id: this.photo_id
                })
            ).trigger( "create" );

            // if (this.photo.percent_complete == 100)
            // {
            //     this.$el.find(".finishing").spin({
            //         lines:10,
            //         length:3,
            //         width:2,
            //         radius:3,
            //         trail:50,
            //         speed:1.0,
            //         color:'#000000'
            //     });
            // }
        }

        return this;
    },

    cancel_upload: function()
    {
        var id = this.photo.id;
        var li_view = this;
        snapr.utils.approve({
            "title": "Cancel this upload?",
            "yes_callback": function()
            {
                if (snapr.utils.get_local_param( "appmode" ))
                {
                    pass_data( "snapr://upload?cancel=" + id );
                }
                li_view.remove();
            }
        });
    }

});