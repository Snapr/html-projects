define(['views/share', '../../theme/js/material'], function(share_view, material){
    return share_view.extend({

        events: function(){
              return _.extend({},share_view.prototype.events,{
                  'change .material-choice' : 'append_selected_tags_to_material_box',
                  'click .materials' : 'writeInTag',
                  'click .materials a': 'deleteThis',
                  'submit form': 'check_fields_and_post'
              });
           },

       append_selected_tags_to_material_box: function() {
           var tag = $(".material-choice option:selected").val();
           var container = $(".materials");
           if (tag !== "Suggested Material") { //or else will add txt
               addMaterialButtonToHTML(tag, container);
           }
       },

       writeInTag : function(ev){
           var tags = prompt('Write it own tag', "#");
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
       },

       deleteThis : function(ev){
           $(ev.target).remove();
           ev.stopPropagation();
       },

       check_fields_and_post: function() {
           var materialField = $('.materials').html();
           var location = $('.s-upload-image-location .s-btn-text').html();
           if(location === "Add Location") {
               alert('You must add a location');
           }
           else if (materialField !== "") { //user must input a material
               var matContainer = $('.materials');
               var materials = findHTMLInsideButtons(matContainer);
               var has_predefined = hasPredefined(materials);
               if (has_predefined === false) {
                   alert("You must input a suggested material");
               }
               else {
                   this.share_append_material(materials);
               }
           } else {
               alert('The material field is empty.');
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