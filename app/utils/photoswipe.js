/*global _  define require */
define(['utils/local_storage', 'config'], function(local_storage, config){
    if(config.get('photoswipe') && local_storage.get("appmode") != 'android'){
            require(['photoswipe'], function(PhotoSwipe) {
            $.fn.photoswipe_init = function(id){
                if (this.length){
                    // detach the previous photoswipe instance if it exists
                    var photoSwipeInstance = PhotoSwipe.getInstance( id );

                    if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance !== null){
                        PhotoSwipe.detatch(photoSwipeInstance);
                    }

                    // make sure we set the param backButtonHideEnabled:false to prevent photoswipe from changing the hash
                    photoSwipeInstance = this.photoSwipe( {
                        backButtonHideEnabled: false,
                        preventSlideshow: true,
                        captionAndToolbarFlipPosition: true
                    }, id );
                }
            };
        });
    }else{
        $.fn.photoswipe_init = function(id){
            $(this).each(function(){
                $(this).on('click', function(e){
                    e.preventDefault();
                });
            });
        };
    }
});
