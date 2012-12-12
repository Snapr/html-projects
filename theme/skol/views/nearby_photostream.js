/*global _  define require */
define(['views/base/view', 'views/components/nearby_photostream'],
    function(view, nearby_photostream_base) {

var nearby_photostream_view = nearby_photostream_base.extend({

    defaults: {
        n: 10,
        sort:'weighted_score'
    },

    render: function () {
        this.collection.reset();
        return this;
    },
    render_photos: function () {
        var this_view = this;
        this_view.$el.empty();
        this.collection.each(function (photo, i) {
            var stream_item = new nearby_photostream_item_view({
                model: photo
            });

            this_view.$el.append( stream_item.el );
            // only show the first one
            if(i === 0){
                stream_item.$el.addClass('x-current');//.data('loaded', true);
            }
            stream_item.render();
        });

        _.bindAll(this);
        if(this.collection.length > 1 && !this.interval){
            this.interval = setInterval(this.change, 2000);
        }
    },
    change: function(){
        var current = this.$('.s-home-bg.x-current'),
            next = current.next();
        if(!next.length){
            next = current.siblings().eq(0);
        }
        // while(!next.data('loaded')){
        //     console.log('loaded?', next.data('loaded'));
        //     next = next.next();
        //     if(!next.length){
        //         next = current.siblings().eq(0);
        //     }
        //     console.log('next', next);
        // }

        current.removeClass('x-current').fadeOut();
        next.addClass('x-current').fadeIn();
    }

});

var nearby_photostream_item_view = view.extend({
    className: 's-home-bg',
    render: function () {
        var image = 'https://s3.amazonaws.com/media-server2.snapr.us/lrg/' + this.model.get("secret") + '/' + this.model.get("id") + '.jpg';
        // var this_image = this;
        // $('<img/>').attr('src', image).load(function() {
        //     this_image.$el.data('loaded', true);
        //     this_image.trigger('loaded');
        // });
        this.$el.css('background-image', 'url('+image+')');
    }
});

return nearby_photostream_view;

});
