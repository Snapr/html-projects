/*global _  define require */
define(['views/base/view', 'auth'],
    function(view, auth) {

return view.extend({

	initialize: function () {
        this.load_template('components/auth_header');
		this.render();
	},
	render: function () {
		this.$el.html( this.template( {
			username: auth.get("snapr_user"),
			display_username: auth.get("display_username")
        } ));

        this.$('[data-role="button"]').button();

        return this;
	}

});
});
