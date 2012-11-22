/*global _  define require */
define(['views/base/view', 'views/components/nearby_photostream'],
    function(view, nearby_photostream_base) {

var nearby_photostream_view = nearby_photostream_base.extend({

    render: function () {
        this.collection.reset();
        return this;
    },
    render_photos: function () {
        var this_view = this;
        this.collection.each(function (photo, i) {
            var stream_item = new nearby_photostream_item_view({
                model: photo
            });

            this_view.$el.append( stream_item.el );
            // only show the first one
            if(i>0){
                stream_item.$el.hide();
            }
            stream_item.render();
        });

        _.bindAll(this);
        if(this.collection.length > 1){
            setInterval(this.change, 1000);
        }
    },
    change: function(){
        var current = this.$('.s-home-bg:visible'),
            next = current.next();
        if(!next.length){
            next = current.prevAll().eq(0);
        }
        next.fadeIn();
        current.fadeOut();
    }

});

var nearby_photostream_item_view = view.extend({
    className: 's-home-bg',
    template: _.template('<div style="background-image:url(https://s3.amazonaws.com/media-server2.snapr.us/lrg/<%= photo.get("secret") %>/<%= photo.get("id") %>.jpg)" alt="<%= photo.get("description") %>">'),
    render: function () {
        this.$el.html( this.template({
            photo: this.model
        }));
    }
});

return nearby_photostream_view;

});
