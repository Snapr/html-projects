/*global _  define require */
define([], function(){
    // 1337
    var translation = {
        'Skol Share': '5h4r3',
        'Add text...': '4dd t3Xt',
        'Show Options': '5h0w 0pti0n5',
        'Show Photo': '5h0w Ph0t0',
        'Share to': '5h4r3 t0',
        'Share': '5h4r3',
        'Getting location': 'G3tting l0c4ti0n',
        'Getting Venue': 'G3tting v3nu3',
        "Please set the image to Public before sharing to other services": "plz set the image to Public before sharing to other services",
        "Please enable location services for this app to use these features": "plz enable location services for this app to use these features",
        "No venues nearby": "N0 v3nu35 n34rby",
        'Location Disabled': "l0c4ti0n Di54bl3d"
    };
    return function(text){
        if (text in translation){
            return translation[text];
        }else{
            console.warn(text, 'not in translation');
            return text;
        }
     };
});
