/*global _  define require */
define(['backbone', 'views/base/page', 'views/base/side_scroll', 'collections/photo', 'config'],
    function(Backbone, page_view, side_scroll, photo_collection, config){

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

return page_view.extend({

    el: $('#cities'),

    post_initialize: function(){

        $('a[data-query]', this.$el).live( 'click', function( e ){
            var query = $(this).data('query'),
                current = $(this).data('current'),
                city = $(this).data('city');

            Backbone.history.navigate('#/feed/?' + unescape( query ) + "&feed_title=" + city );
        });

    },

    post_activate: function(){
        this.change_page();
        this.render();
    },

    render: function(){
        $.mobile.showPageLoadingMsg();

        var $el = this.$el,
            streams = this.$el.find('.s-image-streams');

        var empty_once = function(){
            empty_once = $.noop;
            streams.empty();
        };

        _.each( cities, function( details, id ){
            var photos = new photo_collection();
            photos.data = {
                area: details.area,
                n: config.get('side_scroll_initial')
            };
            var li = new side_scroll({
                collection: photos,
                title: details.name
            });

            streams.append( li.el );
            li.render();
            $el.trigger( "create" );

            $.mobile.hidePageLoadingMsg();
        }, this);

    }
});
});
