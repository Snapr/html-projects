/*global _  define require */
define([], function(){
    // 1337
    var translation = {
        // Share
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
        'Location Disabled': "l0c4ti0n Di54bl3d",

        // my account
        'Update my profile details to match Twitter': 'Upd473 my pr0fi1e detail5 to match 7witter',
        'Import Profile': 'Imp0r7 Profi13',
        'Off': '0ff',
        'On': '0n',
        'Show Twitter in my Profile': '5h0w 7wi7t3r in my Profi1e',
        'Show Fsq in my Profile': '5h0w F5q in my Profi13',
        'Show Facebook in my Profile': '5h0w F4c3book in my Profi1e',
        'Show Tumblr in my Profile': '5h0w 7umb1r in my Profil3',
        'Set up': '537 up',
        'Link': '1ink',
        'Unlink': 'Un1ink',
        'Home': 'H0m3',
        'My Account': 'My 4cc0un7',
        'Logout': '10gou7',
        'Quick Links': 'Quick 1ink5',
        'Find Friends': 'Find Fri3nd5',
        'Settings': '537ting5',
        'Info': 'Inf0',
        'About Us': '4b0u7 U5',
        'About Snapr': '4b0u7 5n4pr',
        'Profile': 'Pr0fi13',
        'Your Name': 'Y0ur N4m3',
        'Location': '10c47ion',
        'Website': 'W3b5i7e',
        'Bio': 'Bi0',
        'Notifications': 'N07ific4tion5',
        'Follows': 'F01low5',
        'Likes': '1ik35',
        'Comments': 'C0mm3n75',
        'Comments on Comments': 'C0mm3n75 on Comments',
        'News Updates': 'N3w5 Upd47es',
        'Account': '4cc0un7',
        'Email': '3m4i1',
        'New Password': 'N3w P45sw0rd',
        'Verify': 'V3rify',
        'Save': '54v3',
        'Connect': 'C0nn3c7',
        'Linked Services': '1ink3d 5ervice5'
    };
    var leet = function(text){
        return text
            .replace('a', '4').replace('A', '4')
            .replace('e', '3').replace('E', '3')
            .replace('s', '5').replace('S', '5')
            .replace('t', '7').replace('T', '7')
            .replace('o', '0').replace('O', '0')
            .replace('l', '1').replace('L', '1');
    };
    return function(text){
        if (text in translation){
            return translation[text];
        }else{
            console.warn("'"+text+"': '"+leet(text)+"',");
            return text.toUpperCase();
        }
     };
});
