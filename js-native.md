# Javascript / Native Code interface

## Contents

01. [JS → Native Overview](#1)
02. [Native → JS Overview](#2)
03. [Startup](#3)
 * 3.1. Appmode
 * 3.2. New Users
 * 3.3. Development Server
04. [Login](#4)
05. [Logout](#5)
06. [Geolocation](#6)
07. [Camera](#7)
08. [Camera Library](#8)
09. [Share](#9)
10. [Uploads](#10)
 * 10.1 Start
 * 10.2 Errors
 * 10.3 Sharing errors
11. [Upload Queue](#11)
 * 11.1 Upload Queue Mode
 * 11.2 Upload Connection Errors
 * 11.3 Pausing and Un-Pausing the Queue
 * 11.4 Conection Timeout
 * 11.5 Upload progress
 * 11.6 Upload complete
 * 11.7 Upload failed
 * 11.8 Cancel Upload
 * 11.9 Clear Queue
12. [External URLs](#12)
13. [Third Party OAuth Flow](#13)
 * 13.1 Linking Services
 * 13.2 Signin with Facebook flow
 * 13.3 Errors during OAuth Flow
 * 13.4 Webview Closed
14. [Alerts](#14)
 * 14.1 Simple Alert
 * 14.2 Simple Alert
15. [Actionsheets](#15)
16. [Android Back Button](#16)
17. [Camera+](#17)
 * 17.1 Camera+ settings
 * 17.2 Camera+ edit
18. [Aviary](#18)


<a id="1"></a>
## 1. JS → Native Overview

To pass data to the native code from the HTML we create an iframe and send it a request for a `snapr://` URL.

Watch for any requests for `snapr://` URLs and take appropriate action.

URLs will be in the format `snapr://base?param=value&param2=value`



<a id="2"></a>
## 2. Native → JS Overview

The Native code can call JS functions within the app, and occasionally also passes in data via the Query string when loading views.



<a id="3"></a>
## 3. Startup

When the native code first loads the webview it passes settings via the query string such as stored user login details and appmode / device platform.


### 3.1 App Mode

Append `appmode=true` to the query string when loading the SnaprKit HTML within a native wrapper app.

For platform specific behaviors instead of `true` send `iphone` or `android`, i.e.:

    `appmode=iphone`


### 3.2 New Users

If there is no saved access token the app can show a new user welcome screen.

When loading up the webview add `new_user=true` to the existing query string.


### 3.3 Development Server

Send `environment=X` in order to run the app against different Snapr servers.

All apps should accept `environment=dev` and `environment=live`, and apps may have any number of custom environment setups in their `config.js`

If no param is sent the app will default to live servers.



<a id="4"></a>
## 4. Login

#### JS → Native

Called on login so the native code can use the credentials for upload and store user details to be saved if the app quits.

* **Base**: login
* **Params**
    * **snapr_user**: Username for unique identification and api calls
    * **display_username**: Username for display, may contain spaces
    * **access_token**: The user's Oauth Access Token

Example:

`snapr://login?snapr_user=myusername&display_username=User%20Name&access_token=s3cRetHaShc0De`

#### Native → JS

To load any view (and log in) using stored login credentials append these parameters to the query string when first displaying the webview:

* **snapr_user**: Username for unique identification and api calls
* **display_username**: Username for display
* **access_token**: The user's Oauth Access Token

Example:
     `#/dash/?snapr_user=myusername&display_username=User%20Name&access_token=s3cRetHaShc0De`



<a id="5"></a>
## 5. Logout

Called by the JS on logout to clear the user credentials stored by the native code.

* **Base**: logout
* **Params**: None

Example:

    snapr://logout



<a id="6"></a>
## 6. Geolocation

#### JS → Native

Called to request the users current location. The JS caches location data for ~5min.

* **Base**: get_location
* **Params**: None

Example:

    snapr://get_location

#### Native → JS

When the location has been determined call the javascript function `set_location` with parameters `latitude` and `longitude` in `+/-DDD.DDDDDD` format.

Example:

    set_location(-37.32567, 175.8765)


If there is a problem determining the location call the javascript function `location_error` with an error message string.

Example:

    location_error("User denied Geolocation")



<a id="7"></a>
## 7. Camera

Called to launch native camera from the HTML.

* **Base**: camera

* **Params**: Any params passed should be used to load the #/share/ view once the photo is ready.

Example:

`snapr://camera?comp_id=5`



<a id="8"></a>
## 8. Camera Library

Called to launch device image library from the HTML.

* **Base**: photo-library
* **Params**: Any params passed should be used to load the #/share/ view once the photo is ready.

Example:

`snapr://photo-library?comp_id=5`


<a id="9"></a>
## 9. Share

Once the user has selected a photo redirect to `#/share/` with and params the camera / photo library was launched with

* **comp_id**: When the photo is for a competition this may be passed with `snapr://camera` etc
* **latitude**: Used to perform reverse geolocation and look up Foursquare Venues
* **longitude**
* **redirect_url**: Specifies where the user should be directed when they press the share button
* **photo_path/photo_id**: Path to the image file for display and identification
* **description**: Description text, pass this back after editing to maintain the user's entry
* **location**: Location text, pass this back after editing to maintain the user's entry
* **foursquare_venue_id**:  Pass this back after editing to maintain the user's entry
* **foursquare_venue_name**:  Pass this back after editing to maintain the user's entry



<a id="10"></a>
## 10. Upload

Uploads are handled via the native code so that background uploading can be utilized, and the upload queue can be maintained after quitting and restarting the app.


### 10.1 Start

Called to initiate an upload.

You should pass any params on to the upload API, and also include them in the upload_progress() JSON for the queue.

- **Base**: upload
- **Params**
    - **local_id**: A unique id that is used to identify this upload in the queue
    - **snapr_user**: Username for unique identification and api calls
    - **display_username**: Username for display, may contain spaces
    - **photo**: the photo_path that the share page was loaded with
    - **any other params the share page was loaded with***: You may choose to load #/share with extra params such as location, these will be returned here

    * **snapr api params**: The following params can be passed to the snapr api with the upload, any extra params not documented here should also be sent with the upload.
        * latitude
        * longitude
        * access_token
        * share_location
        * comp_id
        * status
        * foursquare_checkin
        * tumblr
        * facebook_album
        * tweet
        * device_time
        * description

Example:

    snapr://upload?device_time=2012-11-06 14:28:35&description=testing&status=public&tumblr=true&share_location=true&longitude=-122.406500&latitude=37.785833&photo=file%3A%2F%2F%2Fthis%2Fthat%2Fpreview-image.jpg&access_token=s3cRetHaShc0De&snapr_user=myusername&display_username=User%20Name&local_id=102142835


### 10.2 Errors

The API may return an error while attempting an upload.

* 500 response code - Something has gone wrong, it may be temporary, or a bigger problem. Pause the queue and display a generic alert:

 "Upload Error: Server Error"

 The user can then choose to un-pause the queue and try again, or cancel their upload if it continues to fail.

* An error response with type `authentication.authentication_required`, i.e:

        {
            "success": false,
            "date": <timestamp>,
            "error": {
                "type": "authentication.authentication_required",
                "message": <error_message>
            }
        }

 Valid authentication was not provided. Display an alert:

 "Upload Error: Invalid login details"

 Invalidate current token, call the logout function, and direct the user to the root level HTML page.


* An error response with type `validation.duplicate_upload` - This file has been uploaded before, display an alert:

    "Upload Error: This image has been uploaded before"

 Cancel the upload and remove it from the queue.

* An error response with type `validation.corrupt_file` - This file is not a valid JPEG. Display an alert

 "Upload Error: Invalid File"

 Cancel the upload and remove it from the queue.


### 10.3 Sharing errors

The upload may succeed but return errors for sharing to services that the user does not have linked. In this case you need to redirect to the connect view so they can link them.

    {
        "date": <date>,
        "response": {
            "photo": <photo object>,
            "facebook": {
                "success": false,
                "error": {
                    "message": "No Facebook Account Linked.",
                    "type": "linked_service.facebook.no_account"
                }
            },
            "<service>": {
                "success": false,
                "error": {
                    "message": "No <service> Account Linked.",
                    "type": "linked_service.<service>.no_account"
                }
            },
            ...
        },
        "success": true
    }

Currently this is handled by directing the app to:
        `#/connect/?to_link=facebook,<service>,...&photo_id=<photo_id>&redirect_url=<current_app_url>`

The services currently supported by Snapr are `facebook`, `twitter`, `tumblr`, `foursquare`, and `appdotnet`.

All new implementations should use the new `upload_sharing_failed(photo_id, service_list)` function as opposed to navigating the webview (both options a re currently supported).

   `upload_sharing_failed('MAD', ['facebook', '<service>', ...]);`



<a id="11"></a>
## 11. Upload Queue

The upload queue manages the progress of uploads for the app.


### 11.1 Upload Queue Mode

The queue can be set to be active when in Wi-Fi connections only:

    snapr://upload?setting=Wi-Fi Only
    snapr://upload?setting=On
    snapr://upload?setting=Stopped

These options are set by the user. Not all apps will use them, the queue should default to being `On`.


### 11.2 Upload Connection Errors

If the queue encounters server errors (such as a 500 error), or connection issues, it should automatically become `paused`.


### 11.3 Pausing and Un-Pausing the Queue

#### Native → JS

If the queue becomes paused the native code should update the JS with its status:

    queue_settings('<setting>' , <paused:boolean>);

i.e. `queue_settings('On' , true);`

The app should automatically attempt to un-pause the queue if it is relaunched after quit or if the user switches back from another app.

Don't forget to call `queue_settings('<setting>' , false)` if you un-pause the queue.

#### JS → Native

The user can also attempt to un-pause the queue. Should the queue fail again after this it should automatically return to being paused.

The URLs to pause / un pause the queue from the JS are:

    snapr://upload?start
    snapr://upload?stop

Don't forget to call `queue_settings('<setting>' , true)` if you re-pause the queue.


### 11.4 Connection Timeout

During upload the queue should attempt to recover from temporary interruptions to the connection (without pausing).

Note that once the upload has reached 100% complete there is sometimes a delay before the upload API returns success, you should not automatically restart the upload after that point.


### 11.5 Upload progress

As a photo is uploaded call the `upload_progress()` JS function to update the progress display.

Call the function with either a Javascript object or JSON text.

Any time there is a change to the queue status you should call `upload_progress()` at least once - for example if a new upload is added, but there is no connection, call `upload_progress()` so we can update the queue to show the stalled item.

You should also be sure `upload_progress()` is called at least once on any completion event that changes the status of the queue - including an image being removed from the queue due to completion, or the queue being paused / un paused.

Format for JSON data:

    {
        "uploads": [
            {
                "upload_status": "active",
                "percent_complete": 27,
                "local_id": "92135044",
                "thumbnail": "file:///this/that/92135044.jpg",

                any other parameters that were passed with the snapr://upload call

            }
        ]
    }

Valid statuses:

* waiting
* active
* completed
* canceled


### 11.6 Upload complete

When an upload competes call the javascript function `upload_completed` with it's `local_id` and the `snapr_id` returned from the server.

Example:

    upload_completed('92135044', 'LOG');


### 11.7 Upload failed

When an upload fails call the javascript function `upload_failed` with it's `local_id` and an error message.

Example:

    upload_failed('92135044', 'Duplicate upload');


### 11.8 Cancel Upload

#### JS → Native

Called to cancel an upload (active or queued).

* **Base**: upload
* **Params**:
    * **cancel**: The local_id of the upload

Example:

    snapr://upload?cancel=102142835

#### Native → JS

When an upload is canceled call the javascript function `upload_canceled` with it's `local_id`.

Example:

    upload_canceled('102142835');


### 11.9 Clear Queue

To completely clear the current Queue:

    snapr://upload?clear




<a id="12"></a>
## 12. External URLs

Any links from within the HTML that link to external addresses, i.e. `http://something` as opposed to `#/feed/` will be opened in a separate modal webview.



<a id="13"></a>
## 13. Third Party OAuth Flow

The SnaprKit module loads all requests for external URLs in a separate modal webview.

In order to avoid the need to expose OAuth client and secret data for those services we access them via proxy URLs on the Snapr server that also handle linking / signin / account creation and a number of error cases.


### 13.1 Linking Services

1. The Linking URL is launched via a webview URL that contains an encoded redirect URL to be displayed after linking:

 `http://sna.pr/api/linked_services/<service>/oauth/?redirect=snapr%3A%2F%2Fredirect%3Fredirect_url%3Dfile%253A%2F%2F%2Fpath%2Findex.html%2523%2Fmy-account%2F%253F&display=touch&access_token=<token>`

2. Snapr API redirects webview to the 3rd party, authentication is performed

3. 3rd party redirects webview back to snapr API:

 `http://sna.pr/api/linked_services/<service>/oauth/?code=<authorized code>`

4. Snapr API links the account.

5. Because the webview may not accept a local address as a redirect (i.e. `file://`) the webview is directed to a `snapr://redirect URL`, with some extra params:
                             `snapr://redirect?redirect_url=file%3A///path/index.html%23/my-account/%3F&username=<Full Name>`

5. The Native code catches the `snapr://` URL and redirects the JS app to the given address.
    *   The native code must be sure that it correctly decodes the `redirect_url`,
    *   It must also take any extra parameters that have been sent back and append them to the original `redirect_url`

    `file:///path/index.html#/my-account/?username=<Full Name>`


### 13.2 Sign-in with Facebook

Signing in with Facebook is similar to Linking services.

1. The Linking URL is launched via a webview URL that contains an encoded redirect URL to be displayed after linking:
    `http://sna.pr/api/linked_services/facebook/signin/?redirect=snapr://redirect?redirect_url=file%3A///path/index.html%23/login/%3Ffacebook_signin%3Dtrue&display=touch&client_id=<client_id>&client_secret=<client_secret>&create=false`

2. Snapr API redirects webview to the 3rd party, authentication is performed

3. 3rd party redirects webview back to snapr API:

 `http://sna.pr/api/linked_services/facebook/signin/?code=<code>`

4. Because the webview may not accept a local address as a redirect (i.e. `file://`) the webview is directed to a `snapr://redirect URL`, with some extra params:
      `snapr://redirect?redirect_url=file%3A///path/index.html%23/login/%3Ffacebook_signin%3Dtrue&access_token=<access_token>&display_username=<display_username>&snapr_user=<username>`

5. The Native code catches the `snapr://` URL and redirects JS app to the given address.
    *   The native code must be sure that it correctly decodes the `redirect_url`,
    *   It must also take any extra parameters that have been sent back and append them to the original `redirect_url`
        `file:///path/index.html#/login/?facebook_signin=true&display_username=<display_username>&access_token=<access_token>&snapr_user=<username>`


### 13.3 Errors during OAuth Flow

Errors will return the `redirect_url` in a similar fashion to success, but instead of extra params like `username` you'll see params like `error`. Redirect to the supplied url with the extra params as normal.


### 13.4 Webview Closed

If the user presses close on the webview you need to find the `redirect` form the original webview request and redirect the JS to it with `error=Linking%20Closed`.

The original will be in the format: `snapr://redirect?redirect_url=file%3A///path/index.html%23/login/%3Fparam%3Dvalue` from this you need to extract and decode `redirect_url`




<a id="14"></a>
## 14 Alerts

Native replacements for javascript `alert()` and `confirm()`

### 14.1 Simple Alert

A simple alert with only one button, like the JS native `alert()`

* **Base**: alert
* **Params**
    * **title**: Alert title
    * **otherButton1**: "OK"
    * **alertID**: 0 - simple alerts are not responded to
    * **message**: Body of the alert, may be empty allowing title-only

Example:

    snapr://alert?title=Warning&otherButton1=OK&alertID=0&message=Something%20is%20not%20right


### 14.2 Full Alert functionality (Not yet used)

#### JS → Native

All buttons are optional but either `cancelButton` or `otherButton1` must be supplied

* **Base**: alert
* **Params**
    * **title**: Alert title
    * **cancelButton**: Button label (buttonIndex 0)
    * **otherButton1**: Button label (buttonIndex 1)
    * **otherButton2**: Button label (buttonIndex 2)
    * **otherButton3**: Button label (buttonIndex 3)
    * **alertID**: Unique int
    * **message**: Body of the alert, may be empty allowing title-only

Example:

    snapr://alert?title=Are%20you%20sure&otherButton1=Yes&cancelButton=No&alertID=34

#### Native → JS

When the user taps a button call the javascript function `tapped_alert` with parameters `alertID` and `buttonIndex`

Example:

    tapped_alert(34, 1);



<a id="15"></a>
## 15. Actionsheets


#### JS → Native

All buttons are optional but either `cancelButton`, `destructiveButton` or `otherButton1` must be supplied

* **Base**: action
* **Params**
    * **title**: Title
    * **destructiveButton**: Button label (buttonIndex -1)
    * **cancelButton**: Button label (buttonIndex 0)
    * **otherButton1**: Button label (buttonIndex 1)
    * **otherButton2**: Button label (buttonIndex 2)
    * **otherButton3**: Button label (buttonIndex 3)
    * **actionID**: Unique int

Example:

     `snapr://action?title=Are%20you%20sure&destructiveButton=Yes&cancelButton=No&actionID=36`

#### Native → JS

When the user taps a button call the javascript function `tapped_action` with parameters `actionID` and `buttonIndex`

Example:

    tapped_action(36, -1);



<a id="16"></a>
## 16. Android Back Button

### Native → JS

Use this to go back instead of history - it handles closing dialogs, and sticky situations where back would mistakenly lead you to a web based OAuth flow.

Example:

    back();



<a id="17"></a>
## 17. Camera+

SnaprKit has built in options for integrating with the Camera+ iOS app APIs.


### 17.1 Camera+ settings

When the user saves settings related to camera+ this callback url will notify native code.

* **Base**: camplus/settings
* **Params**
    * **camplus_camera**: bool
    * **camplus_edit**: bool
    * **camplus_lightbox**: bool

Example:
    `snapr://camplus/settings?camplus_camera=true&camplus_edit=true&camplus_lightbox=true`

### 17.2 Camera+ edit

When the user taps the edit with camera+ button

* **Base**: camplus/edit
* **Params**
    * **photo_url**: photo_url
    * **description**: pass back after editing so description is retained
    * **foursquare_venue_name**: pass back after editing so venue is retained
    * **foursquare_venue_id**: pass back after editing so venue is retained
    * **location**: pass back after editing so location name is retained

Example:

`snapr://camplus/edit?photo_url=file%3A%2F%2F%2Fthis%2Fthat%2Fpreview-image.jpg&description=testing&location=New%20York`

Pass back any extra supplied parameters such as `foursquare_venue` via the query string when returning to the webview.


<a id="18"></a>
## 18. Aviary

SnaprKit has options for integrating with the Aviary SDK if its has been included with the build.

### Aviary edit

When the user taps the edit with aviary button:

* **Base**: aviary/edit
* **Params**
    * **photo_url**: photo_url
    * **description**: pass back after editing so description is retained
    * **foursquare_venue_name**: pass back after editing so venue is retained
    * **foursquare_venue_id**: pass back after editing so venue is retained
    * **location**: pass back after editing so location name is retained

Example:
     `snapr://aviary/edit?photo_url=file%3A%2F%2F%2Fthis%2Fthat%2Fpreview-image.jpg&description=testing&location=New%20York`

Pass back any extra supplied parameters such as `foursquare_venue` via the query string when returning to the webview.


