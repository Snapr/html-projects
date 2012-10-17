/*global _  define */

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
        },
        replace_from_template: function(context, selectors, template, el){
            // replace children of `selector` in `el` (defaults to this.$el)
            // with children of `selector` in rendered `template` (defaults to this.template)

            template = template || this.template;
            el = el || this.$el;

            var html = $(template(context));

            _.each(selectors, function(selector){
                el.find(selector).empty().append(html.find(selector).children());
            });
        }
    });
});
