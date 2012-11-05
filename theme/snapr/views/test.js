/*global _  define require */
define(['views/home'],
    function(home_view){
return home_view.extend({

    post_initialize: function(options){
        home_view.prototype.post_initialize.call(this, options);
        alert('I hyjacked the home view!');
    }

});
});
