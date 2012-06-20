define(['async!http://maps.googleapis.com/maps/api/js?sensor=true'], function(){
    var map = {}
    map.overlays = {};
    map.overlays.Thumb = function(type, data, map_instance, extra_class){
        // image as JS object in format the snapr api returns
        this.type_ = type;
        this.data_ = data;
        this.map_ = map_instance;
        this.extra_class_ = extra_class;

        // We define a property to hold the image's
        // div. We'll actually create this div
        // upon receipt of the add() method so we'll
        // leave it null for now.
        this.div_ = null;

        // Explicitly call setMap() on this overlay
        this.setMap(map_instance);
    };

    map.overlays.Thumb.prototype = new google.maps.OverlayView();
    map.overlays.Thumb.prototype.get_div = function(){
        var data_id = this.data_.id;

        if (this.type_ == 'photo') {
            return $(this.map.snapr.thumb_template({photo:this.data_})).show();
        } else {  //spot
            return $(this.map.snapr.spot_template({spot:this.data_})).show();
        }

    };
    map.overlays.Thumb.prototype.onAdd = function()
    {
        this.added = true;  // google maps sometimes tries to draw a point that hasn't been added - keep track
        // Note: an overlay's receipt of onAdd() indicates that
        // the map's panes are now available for attaching
        // the overlay to the map via the DOM.

        var div = this.get_div();

        // Set the overlay's div_ property to this DIV
        this.div_ = div;

        // We add an overlay to a map via one of the map's panes.
        // We'll add this overlay to the overlayImage pane.
        var panes = this.getPanes();
        $(panes.floatPane).append(this.div_);
    };
    map.overlays.Thumb.prototype.draw = function(){
        // google maps sometimes foolishly tries to draw a point that hasn't
        // been added - so add it before confinuing.
        if(!this.added){
            this.onAdd();
        }
        var overlayProjection = this.getProjection();
        var position = new google.maps.LatLng( this.data_.location.latitude, this.data_.location.longitude );
        var px = overlayProjection.fromLatLngToDivPixel( position );

        this.div_ = this.div_
            .css('position', 'absolute')
            .css('left', px.x + 'px')
            .css('top', px.y + 'px');
    };
    map.overlays.Thumb.prototype.onRemove = function(){
        $(this.div_).remove();
        this.div_ = null;
    };
    map.overlays.Thumb.prototype.hide = function(){
        if (this.div_){
          this.div_.style.visibility = "hidden";
        }
    };
    map.overlays.Thumb.prototype.show = function(){
        if (this.div_){
          this.div_.style.visibility = "visible";
        }
    };
    map.overlays.Thumb.prototype.toggle = function(){
        if (this.div_){
            if (this.div_.style.visibility == "hidden"){
                this.show();
            }else{
                this.hide();
            }
        }
    };
    map.overlays.Thumb.prototype.toggleDOM = function(){
        if (this.getMap()){
            this.setMap( null );
        }else{
            this.setMap( this.map_ );
        }
    };

    map.overlays.CurrentLocation = function(data, map_instance){
        map.overlays.Thumb.call(this, undefined, data, map_instance);
    };
    map.overlays.CurrentLocation.prototype=_.clone(map.overlays.Thumb.prototype);
    map.overlays.CurrentLocation.prototype.get_div = function(){
        return $(this.map.snapr.location_template()).show();
    };

    map.geocoder = new google.maps.Geocoder();

    return map;

});
