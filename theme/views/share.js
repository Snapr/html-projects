define(['views/share', '../../theme/views/material'], function(share_view, material){
    return share_view.extend({

        post_activate: function(options){

            var search = $('div[data-role="footer"] .ui-btn:contains(POST)');
            search.css("background-color","lightblue");

            if(!auth.has('access_token')){
                var query = new Query(this.options.query);
                query.set('redirect', escape(window.location.href));
                this.output_data = this.previous_view.output_data;  // grab fx output data if present
                window.location.href = '#/share-preview/?' + query.toString();
                return;
            }

            // clear out old details
            this.$(".x-content").empty();

            this.change_page();

            this.query = options.query;

            if(this.query.comp_id){
                this.comp = new comp_model({id: this.query.comp_id});
                this.comp.deferred = $.Deferred();
                var comp = this.comp;
                this.comp.fetch({success:function(){comp.deferred.resolve();}});
            }else{
                this.comp = null;
            }

            this.location = {};
            if (this.query.foursquare_venue_id && this.query.foursquare_venue_name){
                this.location.foursquare_venue_id = this.query.foursquare_venue_id;
                this.location.foursquare_venue_name = unescape(this.query.foursquare_venue_name);
            }
            if (!!Number(this.query.latitude) && !!Number(this.query.longitude)){
                this.location.latitude = this.query.latitude;
                this.location.longitude = this.query.longitude;
            }

            this.get_photo();
        },

        events: {
        'click .x-photo': 'show_lightbox',
        'click .x-lightbox': 'hide_lightbox',
        'change .x-status': 'toggle_status',
        'click .x-location': 'toggle_location_sharing',
        'change .x-photo-sharing input': 'toggle_sharing',
        'change .x-photo-sharing select': 'toggle_sharing',
        'vclick .x-photo-sharing .ui-disabled': 'share_alert',
        'click .x-photo-toggle': 'toggle_photo',
        'change .x-description': 'update_description',
        'change .material-choice' : 'append_selected_tags_to_material_box',
        'click .materials a': 'deleteThis',
        'click .materials' : 'writeInTag',
        'submit form': 'check_fields'
    },

        append_selected_tags_to_material_box: function() {
            var tag = $(".material-choice option:selected").val();
            var container = $(".materials");
            if (tag !== "Suggested Material") { //or else will add txt
                addMaterialButtonToHTML(tag, container);
            }
        },

        writeInTag : function(ev){
            var tag = prompt('Write it own tag', "#");
            tag = tag.trim();
            var container = $('.materials');
            addMaterialButtonToHTML(tag, container);
        },

        check_fields: function() {
            var materialField = $('.materials').html();
            var location = $('.s-upload-image-location .s-btn-text').html();
            if(location === "Add Location") {
                alert('You must add a location, my friend');
            }
            else if (materialField !== "") { //user must input a material
                var matContainer = $('.materials');
                var materials = findHTMLInsideButtons(matContainer);
                materials = materials.trim();
                this.share_append_material(materials);
            } else {
                alert('The material field is empty.');
            }
        },

        share_append_material: function(materials) {
            var caption = $(".s-textarea").val();
            //materials = materials.trim();
            var assembledDescription = createDescription(caption, materials);
            $(".s-textarea").val(assembledDescription);
            this.share();
        },

        deleteThis : function(ev){
            $(ev.target).remove();
            ev.stopPropagation();
        },

        // check_fields: function() {
        //     var materials = $(".materials").val();
        //     var location = $('.s-upload-image-location .s-btn-text').html();
        //     if(location === "Add Location") {
        //         alert('You must add a location, my friend');
        //     }
        //     else if (materials !== "") {
        //         this.share_append_material();
        //     } else {
        //         alert('The material field is empty.');
        //     }
        // },

        // share_append_material: function() {
        //     var description = $(".s-textarea").val();
        //     var materials = $(".materials").val();
        //     $(".s-textarea").val(description + ' ' + materials);
        //     this.share();

        // }

        // append_selected_tags_to_description : function(){
        //     var description = $(".s-textarea").val();
        //     var tag = $(".material-choice option:selected").val();
        //     if(tag === "Select Material") { //value if there is no tag
        //         alert("You have to select a material, my friend");
        //     }else {
        //         $(".s-textarea").val(description + ' ' + tag);
        //         this.share();
        //     }
        // },

        // append_selected_tags_to_material_box: function() {
        //     var current = $(".materials").val();
        //     var tags = $(".material-choice option:selected").val();
        //     if (tags !== "Select Material") { //or else will add txt
        //         $('.materials').val(current + ' ' + tags);

        //     }
        // },

    });
});



