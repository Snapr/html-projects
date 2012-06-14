/*global _  define require */
define(['photoswipe'], function(){
    $.fn.photoswipe_init = function(id){
        if (this.length){
            // detach the previous photoswipe instance if it exists
            var photoSwipeInstance = Code.PhotoSwipe.getInstance( id );

            if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance !== null){
                Code.PhotoSwipe.detatch(photoSwipeInstance);
            }

            // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
            photoSwipeInstance = this.photoSwipe( {
                backButtonHideEnabled: false,
                preventSlideshow: true,
                captionAndToolbarFlipPosition: true,
                allowUserZoom: false
            }, id );
        }
    };
});
