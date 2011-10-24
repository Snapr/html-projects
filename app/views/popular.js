tripmapper.views.popular = Backbone.View.extend({
    el: $('#popular'),
    initialize: function(){
        console.log('initialise popular view');
    },
    render_list: function(){
        console.log('render popular view',collection);
    }
})