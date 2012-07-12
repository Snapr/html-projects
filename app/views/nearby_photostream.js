/*global _  define require */
define(['backbone', 'utils/geo', 'collections/photo'],
    function(Backbone, geo, photo_collection) {

var nearby_photostream_view = Backbone.View.extend({

	template: _.template( $("#nearby-photostream-template").html() ),
	collection: new photo_collection(),

	events: {
		'click [data-role="button"]': 'render_photos'
	},

	initialize: function () {

		var this_view = this;
		
		this.search_options = {
			n: 4,
            sort:'weighted_score',
		};

		var success_callback = function( location ) {      
            this_view.search_options.latitude = location.coords.latitude;
            this_view.search_options.longitude = location.coords.longitude;
            this_view.search_options.nearby = true;
            this_view.search_options.radius = 5000;
            this_view.fetch_photos();
        };

        var error_callback = function() {
            this_view.fetch_photos();
        };
       
        geo.get_location( success_callback, error_callback );	
		
		
	},
	render: function () {
		this.$el.html(this.template({}));
		this.$el.find('.thumbs-preview-stream').empty();
        this.$el.find('[data-role="button"]').button();

        return this;
	},
	fetch_photos: function () {
		var this_view = this;

		this_view.collection.fetch({
            data: this.search_options,
            success: function(){
                this_view.render_photos();
            }
        });
	},
	render_photos: function () {
		var $stream = this.$el.find('.thumbs-preview-stream');
		this.collection.each(function (photo) {
			var stream_item = new nearby_photostream_item_view({
                model: photo
            });

            $stream.append( stream_item.el );
            stream_item.render();
		});
	}		

});

var nearby_photostream_item_view = Backbone.View.extend({
	tagName: 'li',
	template: _.template( $('#nearby-photstream-item-template').html() ),
	render: function () {
		this.$el.html( this.template({
            photo: this.model
        }));
	}
});

return nearby_photostream_view;

});