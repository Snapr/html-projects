define(['backbone'], function(Backbone){
    return Backbone.View.extend({
        get_template: function(name){
            var template;
            $.ajax({
                async: false,
                url: 'app/templates/' + name + '.html',
                dataType: 'html',
                success: function(response) {
                    template = _.template(response);
                }
            });
            return template;
        },
        load_template: function(name){
            this.template = this.get_template( name || this.tempate_name || this.options.name );
        }
    });
});
