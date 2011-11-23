tripmapper.views.map = Backbone.View.extend({
    el:$("#map"),
    events:{
        "change #map-filter":"update_filter"
    },
    thumb_template: _.template( $('#thumb-template').html() ),
    flag_template: _.template( $('#flag-template').html() ),
    initialize: function(query){
        _this = this;

        console.log('initialise map view');

        this.query = tripmapper.utils.get_query_params(query);
        var center = new google.maps.LatLng(
            this.query.lat || 0,
            this.query.lng ||0
        );
        this.map_settings = {
            zoom: this.query.zoom||tripmapper.constants.default_zoom,
            center:center,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        $.mobile.changePage("#map",{changeHash:false,transition:'flip'});
        this.create_map();
        // this.render();
    },
    create_map: function(){
        this.map = new google.maps.Map(
            document.getElementById("google-map"),
            this.map_settings
        );
        
        _this = this;
        
        // if(this.query.photo_id && this.query.lat && this.query.lng){
        //     this.place_pin();
        // }
        var b = google.maps.event.addListener(this.map, "bounds_changed", function() {
            console.warn('bounds_changed');
        });
        var z = google.maps.event.addListener(this.map, "zoom_changed", function() {
            console.warn('zoom_changed');
        });
        var idle = google.maps.event.addListener(this.map,"idle", function() {
            _this.get_thumbs();
        });

    },
    place_thumb: function(model){
        var thumb = new tripmapper.SnapOverlay('photo', model.attributes, this.map, false);
    },
    place_pin: function(lat,lng){
        lat = lat || this.query.lat;
        lng = lng || this.query.lng;
        var marker = new google.maps.Marker({  
            position: new google.maps.LatLng(lat, lng),
            map: this.map,
            title: 'My workplace',
            clickable: false
        });
    },
    get_thumbs: function(){
        this.thumb_collection = new tripmapper.models.thumb_collection;
        this.thumb_collection.data = {}
        // if(this.query.show != 'just-one'){
        if(!this.query.photo_id){
            this.thumb_collection.data.area = this.map.getBounds().toUrlValue(4);
            this.thumb_collection.data.n = 10;
        }else{
            this.thumb_collection.data.photo_id = this.query.photo_id;
            this.thumb_collection.data.n = 1;
        }
        var _this = this;
        this.thumb_collection.fetch({
            success:function(s){
                console.warn('success',s);
                console.warn('_this',_this);
                _that = _this;
                
                _.each( _this.thumb_collection.models , function(thumb){
                    _this.place_thumb(thumb);
                });
            },
            error:function(e){
                console.warn('error',e)
            }
        });
    },
    update_filter: function(){
        var filter = $('#map-filter').val();
        switch(filter){
            case 'all':
                // 
                break;
            case 'following':
                // 
                break;
            case 'just-me':
                // 
                break;
            case 'just-one':
                // 
                break;
        }
        console.warn('filter',filter);
    }
})