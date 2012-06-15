/*global _  define require */
define(['config', 'backbone', 'native'], function(config, Backbone, native){
return Backbone.View.extend({

    className: "upload-settings",

    initialize: function()
    {
        this.template = _.template( $("#upload-mode-template").html() );
    },

    events: {
        "click .upload-mode-toggle label": "upload_mode_toggle",
        "click .upload-pause": "upload_pause_toggle"

    },

    render: function()
    {
        this.$el
            .html( this.template({
                upload_mode: config.get('upload_mode'),
                upload_paused: config.get('upload_paused')
            }) )
            .trigger("create");
        if (config.get('upload_mode') == "On")
        {
            this.$el.find( "#upload-mode-on" ).attr("checked", true);
        }
        else
        {
            this.$el.find( "#upload-mode-wifi" ).attr("checked", true);
        }

        this.$el.find( "input[type='radio']" ).trigger( "refresh" );

        return this;
    },

    upload_mode_toggle: function( e )
    {
        var upload_mode = e.currentTarget.htmlFor;

        this.$el.find( "input[type='radio']" ).attr("checked", false);

        if (upload_mode == "upload-mode-on")
        {
            this.$el.find( "#upload-mode-on" ).attr("checked", true);
            native.pass_data( "snapr://upload?setting=On" );
        }
        else
        {
            this.$el.find( "#upload-mode-wifi" ).attr("checked", true);
            native.pass_data( "snapr://upload?setting=Wi-Fi Only" );
        }

        this.$el.find( "input[type='radio']" ).checkboxradio().checkboxradio("refresh");
    },

    upload_pause_toggle: function( e )
    {
        console.log( "upload_pause_toggle", e, $(e.target).data("icon") );
    }
});
});
