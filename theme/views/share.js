define(['views/share', '../../theme/views/material'], function(share_view, material){
    return share_view.extend({

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
        'submit form': 'check_materials_field'
    },

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

        append_selected_tags_to_material_box: function() {
            var current = $(".materials").val();
            var tags = $(".material-choice option:selected").val();
            if (tags !== "Select Material") { //or else will add txt
                $('.materials').val(current + ' ' + tags);

            }
        },

        check_materials_field: function() {
            var materials = $(".materials").val();
            if (materials !== "") {
                this.share_append_material();

            } else {
                alert('The material field is empty.');
            }
        },

        share_append_material: function() {
            var description = $(".s-textarea").val();
            var materials = $(".materials").val();
            $(".s-textarea").val(description + ' ' + materials);
            this.share();

        }

    });
});



