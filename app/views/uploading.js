snapr.views.uploading = Backbone.View.extend({
    initialize: function()
    {
        this.el.live( "pagehide", function( e )
        {
            $(e.target).undelegate();
            
            return true;
        });

        $(this.el).find('[data-role="content"]').empty();
        
        $.mobile.changePage( $("#uploading"), {changeHash: false} );
        
        this.template = _.template( $("#uploading-template").html() );
                
        this.pending_uploads = {};
        
        if (this.options.query.photo_id)
        {
            this.upload_completed( 0, this.options.query.photo_id);
        }
        else{
            // testing upload stuff

            var test_data = {
                 "uploads": [
                     {
                         "id": 5345233,
                         "thumbnail": "http://media-server2.snapr.us/sml/dev/b1329ff1029c2a686ad78b94a66eea76/Z4K.jpg",
                         "upload_status": "active", //"waiting|active|canceled|hold",
                         "percent_complete": 50,
                         "status": 'public', //"public|private|queued",
                         "description": "Here's a cool photo of stuff!",
                         "location": {
                             "latitude": 51.553978,
                             "location": "New York",
                             "longitude": -0.076529
                         },
                         "date": "2011-04-12 20:50:10 +0100",
                         "shared": {
                             "tweeted": true,
                             "facebook_newsfeed": true,
                             "foursquare_checkin": true,
                             "tumblr": true,
                             "venue_id": 123,
                             "venue_name": "some bar",
                             "venue_source": "Foursquare"
                         }
                     },
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
                 ]
             };

             // setTimeout(function() {
             //        console.warn("testing 1", test_data);
             //        test_data.uploads[0].percent_complete = 40;
             //        upload_progress(test_data);
             //     }, 3000);
             //         
             //     setTimeout(function() {
             //        console.warn("testing 2", test_data);
             //        test_data.uploads[0].percent_complete = 60;
             //        upload_progress(test_data);
             //     }, 6000);
             // 
             //     setTimeout(function() {
             //        console.warn("testing 3", test_data);
             //        test_data.uploads[0].percent_complete = 80;
             //        upload_progress(test_data);
             //     }, 9000);
             // 
             //     setTimeout(function() {
             //        console.warn("testing 4", test_data);
             //        test_data.uploads[0].percent_complete = 100;
             //        upload_progress(test_data);
             //     }, 12000);
             // 
             //     setTimeout(function() {
             //        console.warn("testing 5");
             //        upload_completed( 5345233, "Z4K");
             //     }, 14000);


                 // setTimeout(function() {
                 //    console.warn("testing 3", test_data);
                 //    test_data.uploads.shift();
                 //    test_data.uploads[0].percent_complete = 50;
                 //    upload_progress(test_data);
                 // }, 9000);
                 //         
                 // setTimeout(function() {
                 //    console.warn("testing 4", test_data);
                 //        test_data.uploads[0].percent_complete = 100;
                 //        upload_progress(test_data);
                 //     }, 12000);
                 //         
                 // setTimeout(function() {
                 //    console.warn("testing 5", test_data);
                 //        test_data.uploads.shift();
                 //        upload_progress(test_data);
                 //     }, 14000);

            // end testing
        }
    },

    events: {
        "click .cancel-uploads": "cancel_uploads"
    },
    
    cancel_uploads: function()
    {
        _.each( this.pending_uploads, function( photo, id )
        {
            snapr.utils.approve({
                "title": "Cancel this upload?",
                "yes_callback": function(){
                    if (snapr.utils.get_local_param("appmode")){
                        window.location = "snapr://upload?cancel=" + id;
                    }
                    else{
                        Route.navigate( "#/upload/", true );
                    }
                }
            });
            
        }, this );
    },
    
    upload_progress: function( upload_data )
    {
        var $content = $(this.el).find('[data-role="content"]').empty();
        
        if (upload_data.uploads.length == 0)
        {
            $(this.el).find(".cancel-uploads").hide();
        }
        else
        {
            $(this.el).find(".cancel-uploads").show();
        }
        
        var upload_heart_template = _.template( $("#uploading-template").html() );
        
        _.each( upload_data.uploads, function( photo )
        {
            this.pending_uploads[photo.id] = new snapr.views.upload_progress_li({
                template: upload_heart_template,
                photo: photo
            });
            $content.append( this.pending_uploads[photo.id].render().el );
        }, this );
        
        // $(this.el).find(".upload-progress-container").listview().listview("refresh");
        
    },
    
    upload_completed: function( queue_id, snapr_id )
    {
        this.pending_uploads[queue_id] && delete this.pending_uploads[queue_id];
        
        Route.navigate( "#/love-it/?shared=true&photo_id=" + snapr_id, true );
    }
});