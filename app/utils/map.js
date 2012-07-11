/*global _  define require google */
define(['async!http://maps.googleapis.com/maps/api/js?sensor=true'], function(){
    var map = {};
    map.overlays = {};

    map.overlays.Base = function(data, map_instance){
        this.data_ = data;
        this.map_ = map_instance;

        // We'll actually create this div in the add() method.
        this.div_ = null;

        this.setMap(map_instance);
    };

    map.overlays.Base.prototype = new google.maps.OverlayView();
    map.overlays.Base.prototype.get_div = function(){
        return $(this.template({data:this.data_})).show();
    };
    map.overlays.Base.prototype.onAdd = function(){
        // Note: an overlay's receipt of onAdd() indicates that
        // the map's panes are now available for attaching
        // the overlay to the map via the DOM.

        // Set the overlay's div_ property to this DIV
        this.div_ = this.get_div();

        // We add an overlay to a map via one of the map's panes.
        // We'll add this overlay to the overlayImage pane.
        var panes = this.getPanes();
        $(panes.floatPane).append(this.div_);
    };
    map.overlays.Base.prototype.draw = function(){
        var overlayProjection = this.getProjection();
        var position = new google.maps.LatLng( this.data_.location.latitude, this.data_.location.longitude );
        var px = overlayProjection.fromLatLngToDivPixel( position );

        this.div_ = this.div_
            .css('position', 'absolute')
            .css('left', px.x + 'px')
            .css('top', px.y + 'px');
    };
    map.overlays.Base.prototype.onRemove = function(){
        $(this.div_).remove();
        this.div_ = null;
    };
    map.overlays.Base.prototype.hide = function(){
        if (this.div_){
          this.div_.style.visibility = "hidden";
        }
    };
    map.overlays.Base.prototype.show = function(){
        if (this.div_){
          this.div_.style.visibility = "visible";
        }
    };
    map.overlays.Base.prototype.toggle = function(){
        if (this.div_){
            if (this.div_.style.visibility == "hidden"){
                this.show();
            }else{
                this.hide();
            }
        }
    };
    map.overlays.Base.prototype.toggleDOM = function(){
        if (this.getMap()){
            this.setMap( null );
        }else{
            this.setMap( this.map_ );
        }
    };


    /* photo
    *********/

    map.overlays.Thumb = function(data, map_instance){
        map.overlays.Base.call(this, data, map_instance);
        this.template = this.map.overlay_templates.thumb;
    };
    map.overlays.Thumb.prototype=_.clone(map.overlays.Base.prototype);


    /* Spot
    ********/
    map.overlays.Spot = function(data, map_instance){
        map.overlays.Base.call(this, data, map_instance);
        this.template = this.map.overlay_templates.spot;
    };
    map.overlays.Spot.prototype=_.clone(map.overlays.Base.prototype);


    /* Current location
    *******************/
    map.overlays.CurrentLocation = function(data, map_instance){
        map.overlays.Base.call(this, data, map_instance);
        this.template = this.map.overlay_templates.location;
    };
    map.overlays.CurrentLocation.prototype=_.clone(map.overlays.Base.prototype);


    /* Geocoder
    ***********/
    map.geocoder = new google.maps.Geocoder();

    return map;

});
