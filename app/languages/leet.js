/*global _  define require */
define([], function(){
    // 1337
    var translation = {
        // home
        'Menu': 'M3nu',
        'Camera Roll': 'C4m3ra R01l',
        'Dashboard': 'D45hb0ard',
        'My Snaps': 'My 5n4p5',
        'Popular': 'P0pu14r',
        'Map': 'M4p',
        'Cities': 'Ci7i35',
        'Spots': '5p075',
        'Activity': '4c7ivity',
        'Leaderboard': '134derb0ard',
        'Tumblr': '7umb1r',
        'Join': 'J0in',
        'Log In': '10g In',
        'Latest': '14735t',
        'Welcome': 'W31c0me',
        'About': '4b0u7',
        'Shoot': '5h0o7',
        'Nearby Images': 'N34rby Image5',
        'Popular Images': 'Popular Image5',
        'No images yet': 'No Image5',
        'Discover': 'Di5c0v3r',
        'Me': 'M3',
        'Login': '10gin',


        //login
        'You must enter your usename and password':"You must enter your usename and passwor",
        "Oops.. Your login or password was incorrect.":"ops.. Your login or password was incorr",
        "Sorry, we had trouble logging in. Please try again.":"orry, we had trouble logging in. Please try again",
        'Log in': '10g in',
        'Username': 'U53rn4me',
        'Password': 'P45sw0rd',
        'Login with': '10gin wi7h',
        'Forgot Password?': 'F0rgo7 P45sword?',


        //app
        'Get the App!': 'G37 the 4pp!',
        'For the best experience please download one of our apps': 'F0r 7h3 be5t experience p1e4se download one of our apps',
        'Does your phone allow browser based uploads?': 'D035 your phone 41low browser based uploads?',
        'Upload via Mobile Web': 'Up104d via Mobil3 Web',


        //dahs
        'Dash': 'D45h',
        'Add your favorite people, or a search for something you want to keep track of.': '4dd y0ur f4vori73 peop1e, or a 5earch for something you want to keep track of.',
        'Add a Person': '4dd 4 P3r50n',
        'Add a Search': '4dd 4 53arch',
        'Keyword': 'K3yw0rd',
        'Anywhere': '4nywh3re',
        'Nearby': 'N34rby',
        'Search': '534rch',


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
            console.warn("        '"+text+"': '"+leet(text)+"',");
            return text.toUpperCase();
        }
     };
});
