/*global _  define require */
define(['backbone', 'auth', 'models/user_settings'],
    function(Backbone, auth, user_settings) {

return Backbone.View.extend({

	template: _.template( $("#auth-header-template").html() ),

	initialize: function () {
		var view = this;

		this.user_settings = new user_settings();
		if (auth.has("access_token")) {
			this.user_settings.fetch({
				data: {
					user_object: true
				},
				success: function () {
					view.render();
				},
				error: function () {
					view.render();
				}
			});
		}
		else {
			view.render();
		}


	},
	render: function () {
		this.$el.html( this.template( {
			logged_in: auth.has("access_token"),
			user_settings: this.user_settings
        } ));

        this.$el.find('[data-role="button"]').button();

        return this;
	}

});
});