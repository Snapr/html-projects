define(['views/share', '../../theme/js/material', 'utils/alerts'], function(share_view, material, alerts){
    return share_view.extend({

        events: {
                  'change .material-choice' : 'append_selected_tags_to_material_box',
                  'click .materials' : "openTagInput",
                  'click .addTag-button' : 'writeInTag',
                  'click .materials a': 'deleteThis',
                  'click #submit-form': 'check_fields_and_post'
           },

       append_selected_tags_to_material_box: function() {
           var tag = $(".material-choice option:selected").val();
           var container = $(".materials");
           if (tag !== "Suggested Material") { //or else will add txt
               addMaterialButtonToHTML(tag, container);
           }
       },

       openTagInput : function(ev){
          $('.aj-add-tag').popup('open');
       },

       writeInTag : function(ev){
           var tags = $('#addTag input').val();
           var container = $('.materials');

           tags = tags.trim();
           tags = tags.replace("##","#");
           tags = tags.replace(/\s{2,}/g, ' '); //no multiple spaces
           if (tags !== "#" || tags !== "") { //if there is some input
               tagArray = tags.split(" ");
               _.each(tagArray, function(t){
                   t = t.replace(";", "");// no punctuation
                   t = t.replace(",", "");
                   t = "#" + t; //make sure each tag starts with #
                   t = t.replace("##","#"); //but not 2 of them
                   if (t.match(/[a-zA-Z]/g)) { //check for letters in tag
                       addMaterialButtonToHTML(t, container);
                   }
               });
           }
           $('.aj-add-tag').popup('close');
       },

       deleteThis : function(ev){
           $(ev.target).remove();
           ev.stopPropagation();
       },

       check_fields_and_post: function() {
           var materialField = $('.materials').html();
           var location = $('.s-upload-image-location .s-btn-text').html();
           if(location === "Add Location" || location === "Getting Location...") {
               alerts.notification(T('ART JUNK'), T('You must include a location'));
           }
           else if (materialField !== "") { //user must input a material
               var matContainer = $('.materials');
               var materials = findHTMLInsideButtons(matContainer);
               var has_predefined = hasPredefined(materials);
               if (has_predefined === false) {
                   alerts.notification(T('ART JUNK'), T('You must include a suggested material'));
               }
               else {
                   this.share_append_material(materials);
               }
           } else {
               alerts.notification(T('ART JUNK'), T('The material field is empty'));
           }
       },

       share_append_material: function(materials) {
           var caption = $(".s-textarea").val();
           caption = caption.replace(/(\r\n|\n|\r)/gm," ");
           var assembledDescription = createDescription(caption, materials);
           $(".s-textarea").val(assembledDescription);
           this.share();
       },

    });

});