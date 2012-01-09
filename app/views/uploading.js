snapr.views.uploading = Backbone.View.extend({
    initialize: function()
    {
        $.mobile.changePage( $("#uploading"), {changeHash: false} );
    }
});