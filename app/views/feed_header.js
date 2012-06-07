/*global _ Route define require */
define(['backbone'], function(Backbone){
return Backbone.View.extend({

    initialize: function(){
        this.query_data = this.options.query_data;

        this.feed_type = null;
        this.feed_parameter = null;
        this.feed_title = this.query_data.feed_title;

        if (this.query_data.keywords){
            this.feed_type = "search";
            this.feed_parameter = this.query_data.keywords;
        }else if (this.query_data.area){
            this.feed_type = "location";
        }else if (this.query_data.favorited_by){
            this.feed_type = "favorites";
            this.feed_parameter = this.query_data.favorited_by;
        }else if (this.query_data.spot && this.query_data.venue_name){
            this.feed_type = "spot";
            this.feed_parameter = this.query_data.venue_name;
        }else{
            this.feed_type = "feed";
        }

        this.template = _.template( $("#feed-header-template").html() );
        this.render();
    },

    render: function(){

        this.$el.html( this.template( {
            feed_title: this.feed_title,
            feed_type: this.feed_type,
            feed_parameter: this.feed_parameter
        } ));

        return this;
    }

});
});
