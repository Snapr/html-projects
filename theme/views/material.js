//the non-backbone way
var materials = {

	artsupplies: {
		name : 'Art Supplies',
		tag: '#artsupplies'
	},

	concrete: {
		name : 'Concrete',
		tag: '#concrete'
	},

	construction : {
		name:  'Construction',
		tag : '#constructionmaterial'
	},
	electronics : {
		name:  'Electronics',
		tag : '#electronics'
	},
	glass : {
		name: 'Glass',
		tag :  '#glass'
	},
	metal : {
		name: 'Metal',
		tag :  '#metal'
	},
	paper : {
		name: 'Paper',
		tag :  '#paper'
	},
	plastic : {
		name:'Plastic',
		tag :  '#plastic'
	},
	rubber : {
		name: 'Rubber',
		tag : '#rubber'
	},
	stone: {
		name: 'Stone',
		tag :  '#stone'
	},
	textile: {
		name: 'Textile',
		tag : '#textile'
	},
	wood: {
		name: 'Wood',
		tag :  '#wood'
	},
	other: {
		name: 'Other',
		tag :  '#othermaterial'
	}
};

//output tags in select list
var material_select_options = function(){
	var html = "";
	_.each(materials, function(m){
		html += "<option value='" + m.tag + "' > " + m.name + "</option>";
	});
	return html;
};

var material_select_html = material_select_options();

//DEALING WITH TAG EDITING AND MANIPULATION

//insert (deleatable) button into html
var addMaterialButtonToHTML = function(tag, container) {
	container.append('<a data-role="button" data-inline="true" data-icon="remove" data-mini="true">' + tag + '</a>').trigger( "create" );
};

//find all html within button children and return as a string
var findHTMLInsideButtons = function(container){
	var materialsString = "";
	container.children('a').each(function(){
		materialsString +=  $(this).html() + ' ';
	});
	materialsString = materialsString.trim();
	return materialsString;
};

//var defaultCaption = "[nocaption]";
var defaultSeparation = "\n"; //between caption and material tags

//a default caption to be able to separate from 
// var addDefaultCaption = function() {
//	return defaultCaption;
// };

var createDescription = function(caption, materials){
	return caption + defaultSeparation + materials;
};

var getCaption = function(description){
	var separatedDescription = splitDescription(description);
	var caption = separatedDescription[0];
	return caption;
};

var getMaterialTags = function(description){
	var separatedDescription = splitDescription(description);
	//what if there is caption, no separation?
	var materials = separatedDescription[1];
	materials = materials.trim();
	return(materials);
};

var makeArray = function(string){
	var array = string.split(" ");
	return array;
};

var splitDescription = function(description){
	var stringArray = description.split(defaultSeparation);
	if (stringArray.length > 1) {
		return(stringArray);
	}
	return [stringArray[0], 'oldWay-tagsinCaption'];

};

