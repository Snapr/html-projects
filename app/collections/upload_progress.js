/*global _  define require */
define(['config', 'backbone'], function(config, Backbone){
    var upload = Backbone.Model.extend({});

    var upload_progress = Backbone.Collection.extend({
        model: upload,
        update: function(col_in){
            var that = this;

            var ids = [];

            _(col_in).each(function(mod_in){
                if (that.get(mod_in.id)){
                    that.get(mod_in.id).set(mod_in);
                } else {
                    that.add(mod_in);
                }

                ids.push(mod_in.id);
            });


            var to_remove = that.reject(function(mod){
                return _(ids).include(mod.id);
            });

            this.remove(to_remove);
            return this;
        }
    });

    return new upload_progress();
});
