var cities = {
    'new-york': {
        'name': 'New York',
        'area': '40.3429,-74.9073,41.0509,-73.052'
    },
    'london': {
        'name': 'London',
        'area': '51.4609,-0.267,51.5335,-0.0351'
    },
    'san-francisco': {
        'name': 'San Francisco',
        'area': '37.6654,-122.6695,37.8499,-122.2057'
    },
    'paris': {
        'name': 'Paris',
        'area': '48.6706,1.91574,49.03479,2.77679'
    },
     'la': {
         'name': 'L.A.',
         'area': '33.17046,-118.93445,34.75812,-116.91571'
    },
    'tokyo': {
        'name': 'Tokyo',
        'area': '35.3201,138.5036,36.0784,140.359'
    },
    'berlin': {
        'name': 'Berlin',
        'area': '52.43404,13.24902,52.57218,13.53398'
    },
    'sydney': {
        'name': 'Sydney',
        'area': '-34.11398,150.85876,-33.67054,151.54472'
    },
    'melbourne': {
        'name': 'Melbourne',
        'area': '-38.76968,143.9288,-37.27467,145.96676'
     },
    'auckland': {
        'name': 'Auckland',
        'area': '-37.11972,174.36127,-36.69255,175.04723'
    }
};

snapr.views.city_stream = snapr.views.side_scroll.extend({
    id: 'cities',
    template: _.template( $('#cities-stream-template').html() ),
    thumbs_template: _.template( $('#cities-thumbs-template').html() ),
    initialize: function(options){
        this.details = options.details;
        snapr.views.side_scroll.prototype.initialize.call(this, options);
    }
});

snapr.views.cities = Backbone.View.extend({

    el: $('#cities'),

    initialize: function()
    {
        this.$el.live('pagehide', function( e ){
            $(e.target).undelegate();
            return true;
        });

        $.mobile.changePage( $("#cities"), {
            changeHash: false
        });

        this.render();
    },
    // populate: function(){
    //     var dash = this;
    //     var options = {
    //         data: {n:6, feed:true},
    //         success: function(){
    //             dash.render();
    //         },
    //         error:function(){
    //             console.error('Error loading dash from server');
    //         },
    //         complete: function(){
    //             $.mobile.hidePageLoadingMsg();
    //         }
    //     };

    //     $.mobile.loadingMessage = "Loading";
    //     $.mobile.showPageLoadingMsg();

    //     this.collection.fetch( options );
    // },
    render: function(){
        var $el = this.$el,
            streams = this.$el.find('.image-streams');

        streams.empty();

        _.each( cities, function( details, id ){
            console.log(details);
            var photos = new snapr.models.photo_collection();
            photos.data = {'area': details.area};
            photos.fetch({
                data:{n:6},
                success: function(){
                    var li = new snapr.views.city_stream({ collection: photos, details: {name: details.name, id: id} });
                    streams.append( li.el );
                    li.render();
                    $el.trigger( "create" );
                }
            });
        }, this);


    }

});
