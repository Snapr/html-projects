define(['backbone'], function(Backbone){
    return Backbone.View.extend({
        load_template: function(name){
            name = name || this.options.name;

            var view = this;
            $.ajax({
                async: false,
                url: 'templates/' + name + '.html',
                dataType: 'html',
                success: function(response) {
                    view.template = _.template(response);
                }
            });
        }
    });
});
