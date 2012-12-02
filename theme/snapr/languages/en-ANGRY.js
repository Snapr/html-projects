/*global _  define require */
define([], function(){
    return function(text){
        var bits = text.split(' ');
        if(bits.length == 1){
            return "fucking " + text;
        }else if(bits[1].length <= 3){
            return bits.slice(0,2).join(' ') + ' fucking ' + bits.slice(2).join(' ');
        }else{
            return bits[0] + ' fucking ' + bits.slice(1).join(' ');
        }
    };
});
