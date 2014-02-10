//the non-backbone way, and what about closure?
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
