snapr.views.feed = Backbone.View.extend({

    events: {
        "click button.more": "more",
        "change .feed-view-toggle": "feed_view_toggle"
    },

    initialize: function( init_options )
    {
        // console.warn( 'initialize feed view', init_options.query );
        var query_data = init_options.query;

        var list_style = query_data.list_style || 'list';

        var toggle_container = this.el.find( ".feed-view-toggle" );
        toggle_container.find( "input[type='radio']" ).attr( "checked", false );
        
        if (list_style == 'grid')
        {
            this.el.find(".feed-content").addClass("grid");
            toggle_container.find("#feed-view-grid").attr( "checked", true );
        }
        else
        {
            this.el.find(".feed-content").removeClass("grid");
            toggle_container.find("#feed-view-list").attr( "checked", true );
        }


        if (query_data.username)
        {
            var feed_header = new snapr.views.user_header({
                username: query_data.username,
                el: this.el.find(".feed-header").empty()
            });
        }
        else
        {
            var feed_header = new snapr.views.feed_header({
                query_data: query_data,
                el: this.el.find(".feed-header").empty()
            });
        }
        
        this.pending_uploads = {};

        var feed_view = this;

        feed_view.el.find(".feed-upload-list").empty();
        feed_view.el.find('ul.gallery').empty();
        
        this.el.live( 'pageshow', function()
        {
            toggle_container.find( "input[type='radio']" ).checkboxradio( "refresh" );

        });

        var $el = $(this.el);

        this.el.live('pagehide', function( e )
        {
            var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );

            if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
            {
                Code.PhotoSwipe.detatch(photoSwipeInstance);
            }
            
            $el.undelegate();
            
            return true; 
        });

        // if we are coming from the map view do a flip, otherwise do a slide transition
        if ($.mobile.activePage.attr('id') == 'map' )
        {
            var transition = "flip";
        }
        else
        {
            var transition = "slide";
        }
        
        $.mobile.changePage( $("#feed"), {
            changeHash: false,
            transition: transition
        });
        
        this.photo_collection = new snapr.models.photo_collection();
        this.photo_collection.url = snapr.api_base + "/search/";
        this.photo_collection.data = query_data;
        this.photo_collection.data.n = snapr.constants.feed_count;
        this.photo_collection.data.list_style && delete this.photo_collection.data.list_style;
        this.populate_feed();
        
        
        // testing upload stuff
        
        
        // var test_data = {
        //      "uploads": [
        //          {
        //              "id": 5345233,
        //              "thumbnail": "./gfx/demo-test.jpg",
        //              "upload_status": "active", //"waiting|active|canceled|hold",
        //              "percent_complete": 50,
        //              "status": 'public', //"public|private|queued",
        //              "description": "Here's a cool photo of stuff!",
        //              "location": {
        //                  "latitude": 51.553978,
        //                  "location": "New York",
        //                  "longitude": -0.076529
        //              },
        //              "date": "2011-04-12 20:50:10 +0100",
        //              "shared": {
        //                  "tweeted": true,
        //                  "facebook_newsfeed": true,
        //                  "foursquare_checkin": true,
        //                  "tumblr": true,
        //                  "venue_id": 123,
        //                  "venue_name": "some bar",
        //                  "venue_source": "Foursquare"
        //              }
        //          },
        //          {
        //              "id": 5345234,
        //              "thumbnail": "./gfx/demo-vert.jpg",
        //              "upload_status": "waiting", //"waiting|active|canceled|hold",
        //              "percent_complete": 0,
        //              "status": 'private', //"public|private|queued",
        //              "description": "test2",
        //              "location": {
        //                  "latitude": 51.553978,
        //                  "location": "New York",
        //                  "longitude": -0.076529
        //              },
        //              "date": "2011-04-12 20:50:10 +0100",
        //              "shared": {
        //                  "tweeted": true,
        //                  "facebook_newsfeed": true,
        //                  "foursquare_checkin": true,
        //                  "tumblr": true,
        //                  "venue_id": 123,
        //                  "venue_name": "some bar",
        //                  "venue_source": "Foursquare"
        //              }
        //          }
        //      ]
        //  };
        // 
        //  setTimeout(function() {
        //         console.warn("testing 1", test_data);
        //         test_data.uploads[0].percent_complete = 99;
        //         upload_progress(test_data);
        //      }, 3000);
        // 
        //      setTimeout(function() {
        //         console.warn("testing 2", test_data);
        //         test_data.uploads[0].percent_complete = 100;
        //         upload_progress(test_data);
        //      }, 6000);
        // 
        //      setTimeout(function() {
        //         console.warn("testing 3", test_data);
        //         test_data.uploads.shift();
        //         test_data.uploads[0].percent_complete = 50;
        //         upload_progress(test_data);
        //      }, 9000);
        // 
        //      setTimeout(function() {
        //         console.warn("testing 4", test_data);
        //             test_data.uploads[0].percent_complete = 100;
        //             upload_progress(test_data);
        //          }, 12000);
        // 
        //      setTimeout(function() {
        //         console.warn("testing 5", test_data);
        //             test_data.uploads.shift();
        //             upload_progress(test_data);
        //          }, 14000);

        // end testing
    },
    
    photoswipe_init: function()
    {
        // detach the previous photoswipe instance if it exists
        var photoSwipeInstance = Code.PhotoSwipe.getInstance( 'feed' );

        if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null)
        {
            Code.PhotoSwipe.detatch(photoSwipeInstance);
        }

        if ($( "ul.gallery a.gallery_link", this.el ).length)
        {
            // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
            var photoSwipeInstance = $( "ul.gallery a.gallery_link", this.el )
                .photoSwipe( {
                    backButtonHideEnabled: false
                }, 'feed' );
        }
        

        $.mobile.hidePageLoadingMsg();
    },
    
    populate_feed: function( additional_data )
    {
        
        var list_style = this.el.find("#feed-view-grid").is(":checked") && 'grid' || 'list';
        
        console.warn('populate feed list style', list_style);
        
        if (this.feed_list)
        {
            this.feed_list.list_style = list_style;
        }

        var feed_view = this;
        var options = {
            success: function()
            {
                // if (!feed_view.feed_list)
                // {
                    feed_view.feed_list = new snapr.views.feed_list({
                        el: feed_view.el.find('ul.gallery').eq(0),
                        collection: feed_view.photo_collection,
                        list_style: list_style
                    });
                // }

                feed_view.feed_list.render( feed_view.photoswipe_init );
                $.mobile.hidePageLoadingMsg();
            },
            error:function()
            {
                console.warn('error');
                $.mobile.hidePageLoadingMsg();
            }
        }
        
        if (additional_data)
        {
            options.add = true;
            this.photo_collection.data = $.extend(this.photo_collection.data, additional_data);
        }

        $.mobile.loadingMessage = "Loading";
        $.mobile.showPageLoadingMsg();
        
        this.photo_collection.fetch( options );
    },
    
    more: function()
    {
        var data = this.photo_collection.data;
        
        data.photo_id && delete data.photo_id;
        data.max_date = this.photo_collection.last().get('date');

        this.populate_feed( data );
        // console.warn( 'more', this.photo_collection.data );
    },
    
    feed_view_toggle: function(e)
    {
        var input_target = $('#' + e.target.id);
        var list_style = input_target.val();
        
        var container = input_target.closest( ".feed-view-toggle" );
        container.find( "input[type='radio']" ).attr( "checked", false );
        input_target.attr( "checked", true );
        container.find( "input[type='radio']" ).checkboxradio( "refresh" );
        
        if (list_style == "list")
        {
            this.el.find(".feed-content").removeClass("grid").trigger("refresh");
        }
        else
        {
            this.el.find(".feed-content").addClass("grid").trigger("refresh");
        }
        
        this.feed_list.list_style = list_style;
        this.feed_list.render( this.photoswipe_init );
    },
    
    upload_progress: function( upload_data )
    {
        var feed_view = this;

        feed_view.el.find(".feed-upload-list").empty();
        
        var upload_li_template = _.template( $("#upload-progress-li-template").html() );
        
        _.each( upload_data.uploads, function( photo )
        {
            feed_view.pending_uploads[photo.id] = new snapr.views.upload_progress_li({
                template: upload_li_template,
                photo: photo
            });
            feed_view.el.find(".feed-upload-list").append( feed_view.pending_uploads[photo.id].render().el );
        })
        
        feed_view.el.find(".feed-upload-list").listview().listview("refresh");
        
    },
    
    upload_completed: function( queue_id, snapr_id )
    {
        // if we are on a feed for the current snapr user
        if (this.options.query.username == snapr.auth.get("username")
            && !this.options.query.photo_id)
        {
            // remove the date restriction if it is present
            if (this.photo_collection.data.max_date)
            {
                delete this.photo_collection.data.max_date;
            }            
            // refresh the feed content
            this.populate_feed();
        }
    }

})