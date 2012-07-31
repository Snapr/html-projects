/*global _  define require */
define(['backbone', 'auth'],
    function(Backbone, auth) {

return Backbone.View.extend({

	template: _.template( $("#auth-header-template").html() ),

	initialize: function () {
		this.render();
	},
	render: function () {
		this.$el.html( this.template( {
			username: auth.get("snapr_user"),
			display_username: auth.get("display_username")
        } ));

        this.$el.find('[data-role="button"]').button();

        return this;
	}

});
});
