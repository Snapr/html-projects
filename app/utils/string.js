/*global _ Route define require */
define([], function(){
var string_utils = {};

string_utils.ordinal = function(number){
    if( number!=11 && number!=12 && number!=13 ){
        number = String(number);
        switch( number.substr(number.length-1) ){
            case '1':
                return number+'st';
            case '2':
                return number+'nd';
            case '3':
                return number+'rd';
        }
    }
    return number+'th';
};

string_utils.zeroFill = function (number, width) {
    width -= number.toString().length;
    if(width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number.toString();
};

string_utils.plural = function(n){
    return (n > 1) ? "s" : "";
};

string_utils.hashtag_links = function( comment ){
    if (comment.length){
        var hashcomment = comment.replace( /[#]+[A-Za-z0-9\-_]+/g,
            function( k ){
                var keyword = k.replace('#', '');
                return '<a href="#/feed/?keywords=' + keyword + '">' + k + '</a>';
            }
        );
        return hashcomment;
    }else{
        return "";
    }
};
string_utils.at_links = function( comment ){
    if (comment.length){
        var atcomment = comment.replace( /[@]+[A-Za-z0-9\-_]+/g,
            function( u ){
                return '<a href="#/feed/?keywords=' + u + '">' + u + '</a>';
            }
        );
        return atcomment;
    }else{
        return "";
    }
};
string_utils.comment_links = function( comment ){
    var hashedcomment = string_utils.hashtag_links( comment );
    var output = string_utils.at_links( hashedcomment );
    return output;
};

string_utils.date_to_snapr_format = function (d) {
    return d.getFullYear() + '-' + string_utils.zeroFill(d.getMonth() + 1, 2) + '-' + string_utils.zeroFill(d.getDate(), 2) + ' 00:00:00';
};
string_utils.convert_snapr_date = function(time){
    time = (time || "").replace(/-/g,"/").replace(/ \//g," -").replace(/[TZ]/g," ");
    return new Date(time);
};
string_utils.short_timestamp = function( time, relative ){
    time = (time || "").replace(/-/g,"/").replace(/ \//g," -").replace(/[TZ]/g," ");
    //add 0000 to set to utc for relative times
    if (relative !== false && time.split(' ').length <3){
        time = time + ' -0000';
    }
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    date = new Date(time),now = new Date(),
    diff = ((now.getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);
    date = new Date(time.replace(/ [\+-]\d{4}$/,'')); //strip TZ
    if (date.getHours() <= 12){
        var hours = date.getHours(),
        ap = 'AM';
    }else{
        var hours = date.getHours() -12,
        ap = 'PM';
    }
    if (relative !== false){
        if ( isNaN(day_diff) || day_diff < 0 )//|| day_diff >= 31 )
            return;
        if (day_diff === 0){
            return(
                diff < 60 && 'just now' ||
                diff < 3600 && Math.floor( diff / 60 ) + "min" ||
                diff < 86400 && Math.floor( diff / 3600 ) + "h ago"
            );
        }
        if (day_diff == 1){
            return 'Yesterday';
        }
        if (day_diff < 7){
            return day_diff + 'd ago';
        }
        if (date.getYear() == now.getYear()){
            return string_utils.ordinal(date.getDate()) + ' ' + months[date.getMonth()];
        }else{
            var yr = String( date.getFullYear() );
            yr = yr.substring(yr.length - 2,yr.length);
            return string_utils.ordinal(date.getDate()) + ' ' + months[date.getMonth()] + ' \'' + yr;
        }
    }
    var full_date = hours+' '+ap+', '+months[date.getMonth()]+' '+date.getDate();
    if (date.getFullYear() == new Date().getFullYear())
        return full_date;
    return full_date+', '+date.getFullYear();
};

string_utils.short_location = function(txt){
    var txt_array = txt.split(', ');
    var new_txt_array = [];
    new_txt_array.push(txt_array[0]);
    if (txt_array.length > 1){
        if (txt_array[0].length + txt_array[1].length < 24){
            new_txt_array.push(txt_array[1]);
        }
    }
    return new_txt_array.join( ", " );
};

string_utils.human_list = function (list) {
    if(list.length == 1) {
        return list[0];
    }
    var copy = list.slice(0);
    var text = copy.pop();
    text = copy.pop() + ' and ' + text;
    while(copy.length) {
        text = copy.pop() + ', ' + text;
    }
    return text;
};

return string_utils;
});
