snapr.views.uploading = Backbone.View.extend({
    initialize: function()
    {
        _.bindAll( this );

        this.el.live( "pagehide", function( e )
        {
            $(e.target).undelegate();
            this.pending_uploads = [];
            $(this.el).find(".upload-progress-container").empty()

            return true;
        });

        //$(this.el).find('[data-role="content"]').empty();

        $.mobile.changePage( $("#uploading"), {changeHash: false} );

        this.current_upload = null;
        this.pending_uploads = {};

        if (this.options.query.photo_id)
        {
            this.upload_completed( 0, this.options.query.photo_id);
        }
        else{
            // testing upload stuff

            var test_data = {"uploads":[{"description":"Pzzz","percent_complete":10,"id":"013FBD4D-7","sharing":{},"date":"2012-03-09 14:25:59 -0500","status":"private","location":{},"shared":{tweeted:true},"upload_status":"Active","thumbnail":"file:///Users/dpwolf/Library/Application Support/iPhone Simulator/5.0/Applications/ECF32C66-12DE-44D8-B2C2-9A02A0DD77BE/Documents/upload/00000000000353013969.jpg"}]}

                 // "uploads": [
                 //     {
                 //         "id": 5345233,
                 //         "thumbnail": "http://media-server2.snapr.us/sml/dev/b1329ff1029c2a686ad78b94a66eea76/Z4K.jpg",
                 //         "upload_status": "active", //"waiting|active|canceled|hold",
                 //         "percent_complete": 50,
                 //         "status": 'public', //"public|private|queued",
                 //         "description": "Here's a cool photo of stuff!",
                 //         "location": {
                 //             "latitude": 51.553978,
                 //             "location": "New York",
                 //             "longitude": -0.076529
                 //         },
                 //         "date": "2011-04-12 20:50:10 +0100",
                 //         "shared": {
                 //             "tweeted": true,
                 //             "facebook_newsfeed": true,
                 //             "foursquare_checkin": true,
                 //             "tumblr": true,
                 //             "venue_id": 123,
                 //             "venue_name": "some bar",
                 //             "venue_source": "Foursquare"
                 //         }
                 //     },
                 //






                     // {
                     //     "id": 5345234,
                     //     "thumbnail": "./gfx/demo-vert.jpg",
                     //     "upload_status": "waiting", //"waiting|active|canceled|hold",
                     //     "percent_complete": 0,
                     //     "status": 'private', //"public|private|queued",
                     //     "description": "test2",
                     //     "location": {
                     //         "latitude": 51.553978,
                     //         "location": "New York",
                     //         "longitude": -0.076529
                     //     },
                     //     "date": "2011-04-12 20:50:10 +0100",
                     //     "shared": {
                     //         "tweeted": true,
                     //         "facebook_newsfeed": true,
                     //         "foursquare_checkin": true,
                     //         "tumblr": true,
                     //         "venue_id": 123,
                     //         "venue_name": "some bar",
                     //         "venue_source": "Foursquare"
                     //     }
                     // }
                 // ]
             // };

             // setTimeout(function() {
             //        console.log("testing 1", test_data);
             //        test_data.uploads[0].percent_complete = 40;
             //        upload_progress(test_data);
             //     }, 3000);
             // //
                 setTimeout(function() {
                    console.log("testing 2", test_data);
                    test_data.uploads[0].percent_complete = 60;
                    upload_progress(test_data);
                 }, 6000);
             //
                 setTimeout(function() {
                    console.log("testing 3", test_data);
                    test_data.uploads[0].percent_complete = 100;
                    upload_progress(test_data);
                 }, 8000);
             //
             //     setTimeout(function() {
             //        console.log("testing 4", test_data);
             //        test_data.uploads[0].percent_complete = 100;
             //        upload_progress(test_data);
             //     }, 12000);
             //
             //     setTimeout(function() {
             //        console.log("testing 5");
             //        upload_completed( 5345233, "Z4K");
             //     }, 14000);


                 // setTimeout(function() {
                 //    console.log("testing 3", test_data);
                 //    test_data.uploads.shift();
                 //    test_data.uploads[0].percent_complete = 50;
                 //    upload_progress(test_data);
                 // }, 9000);
                 //
                 // setTimeout(function() {
                 //    console.log("testing 4", test_data);
                 //        test_data.uploads[0].percent_complete = 100;
                 //        upload_progress(test_data);
                 //     }, 12000);
                 //
                 // setTimeout(function() {
                 //    console.log("testing 5", test_data);
                 //        test_data.uploads.shift();
                 //        upload_progress(test_data);
                 //     }, 14000);

            // end testing
        }
    },

    events: {
        "click .cancel-upload": "cancel_upload"
    },

    cancel_upload: function()
    {
        if (this.current_upload && this.current_upload.id)
        {
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
                        Route.navigate( "#/upload/", true );
                    }
                }
            });

        }
        else
        {
            console.log("current_upload not set when trying to cancel upload");
            Route.navigate( "#/", true );
        }

    },

    upload_progress: function( upload_data )
    {
        console.warn( 'upload_progress: ', JSON.stringify( upload_data ) );

        var $container = $(this.el).find(".upload-progress-container");

        _.each( upload_data.uploads, function( photo, index )
        {
            // console.log("photo: ", photo, " index: ", index)
            if ((photo.upload_status.toLowerCase() == "active") && (!this.current_upload || this.current_upload.id == photo.id))
            {
                if (!this.pending_uploads[photo.id])
                {
                    this.pending_uploads[photo.id] = new snapr.views.upload_progress_li({
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

    },

    upload_completed: function( queue_id, snapr_id )
    {
        if (this.pending_uploads[queue_id])
        {
            this.pending_uploads[queue_id].message = "Completed!";
            this.pending_uploads[queue_id].photo.upload_status = "completed";
            this.pending_uploads[queue_id].post_id = snapr_id;
            this.pending_uploads[queue_id].render();
        }
    },

    upload_cancelled: function( queue_id )
    {

        Route.navigate( "#/", true );
    }
});
