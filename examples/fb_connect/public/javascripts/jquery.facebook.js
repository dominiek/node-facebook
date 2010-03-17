/**
 * Facebook (Connect) plugin
 *
 * By Dominiek ter Heide (dominiek.com)
 * MIT Licensed: http://www.opensource.org/licenses/mit-license.php
 *
 */

(function($){
  
  // Note: these variables are cache, validation is still server-side
  var authenticated = null;
  var authenticatedFbSession = null;
  var apiKey = null;
  var fbOptions = null;
  
  /**
   * Initialize the Facebook JS API, only call this once.
   *
   * @example $.fbInit(MY_FACEBOOK_API_KEY, {'xd_receiver': '/xd_receiver.php'});
   * @desc Initialize with a custom xd_receiver.
   *
   * @param String api_key Your Facebook Application's API Key
   * @param Hash options Valid: 'xd_receiver', 'sessionSyncAction'
   * @return null
   * @type null
   *
   */
  $.fbInit = function (api_key, options) {
    apiKey = api_key;
    fbOptions = options || {reloadIfSessionStateChanged: true, doNotUseCachedConnectState: true};
    FB_RequireFeatures(["Api"], function() {
      FB.Facebook.init(api_key, fbOptions['xd_receiver'] || '/xd_receiver.htm');
    });
  };
  
  /**
   * Start the Facebook Connect process.
   *
   * @example $.fbConnect({'include': ['name']}, function (fbSession) { alert('Done!') });
   * @desc Include only the User's Facebook name when authenticating
   *
   * @param Hash options Valid: 'include'
   * @param Function callback
   * @return null
   * @type null
   *
   */
  $.fbConnect = function(options, callback) {
    options = options || {};
    if(!options['include']) {
      options['include'] = ['name', 'pic'];
    }
    FB_RequireFeatures(["Connect", "Api"], function() {
      FB.Connect.requireSession(function () {
        $.fbProfile(options['include'], function (profile) {
          $.post(fbOptions['sessionSyncAction'] || "/fbSession", profile, function (fbSession) {
            if (fbSession['userId']) {
              authenticated = true;
              authenticatedFbSession = fbSession;
              if(callback) {
                callback(fbSession);
              }
            } else {
              authenticated = false;
              if(callback) {
                callback();
              }
            }
          }, 'json');
        });
      });
    });
  };
  
  /**
   * Logout from Facebook and the current application.
   *
   * @example $.fbLogout(function () { alert('Doneski!') });
   * @desc Simply log out.
   *
   * @param Function callback
   * @return null
   * @type null
   *
   */
  $.fbLogout = function (callback) {
    FB.Connect.logout(function () {
       $.post(fbOptions['sessionSyncAction'] || "/fbLogout", {}, function () {
         callback();
       }, 'json');
    });
  };
  
  /**
   * Check whether the user is authenticated.
   *
   * @example $.fbIsAuthenticated(function (user) { alert('Yes!'); }, function() { alert('No!); });
   * @desc Simply check.
   *
   * @param Function authenticated_callback
   * @param Function not_authenticated_callback
   * @return null
   * @type null
   *
   */
  $.fbIsAuthenticated = function (authenticated_callback, not_authenticated_callback) {
    if(authenticated === null) {
      $.get(fbOptions['sessionSyncAction'] || '/fbSession', {}, function (fbSession) {
        if (fbSession['userId']) {
          authenticated = true;
          authenticatedFbSession = fbSession;
          authenticated_callback(authenticatedFbSession);
        } else {
          authenticated = false;
          not_authenticated_callback();
        }
      }, 'json');
      return;
    }
    if(authenticated === true) {
      authenticated_callback(authenticatedFbSession);
    } else {
      not_authenticated_callback();
    }
  };
  
  /**
   * Fetch profile fields for authenticated user
   *
   * @param Array fields
   * @param Function callback
   * @return null
   * @type null
   *
   */
  $.fbProfile = function (fields, callback) {
    FB_RequireFeatures(["Api"], function() {
      FB.Facebook.apiClient.fql_query("SELECT " + fields.join(', ') + " FROM user WHERE uid="+$.fbCookie('user'), function (rows) { 
        callback(rows[0]);
      });
    });
  };

  /**
   * Get Facebook cookie value.
   *
   * @param String name
   * @return String
   * @type String
   *
   */
  $.fbCookie = function (name) {
    name = apiKey + '_' +name;
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  };
  
  /**
   * Authenticate a Facebook iFrame Application
   *
   * @example $.fbIframeAuthenticate({'canvas_name': 'mypath', 'permissions': ['offline_access', 'stream_publish']})
   * @desc Do a popup authentication for iFrames, Facebook's authentication flow is in a constant state of fuckedness
   *
   * @param Hash options Valid: 'canvas_name', the path of your fb app apps.facebook.com/<canvas_name>, 'permissions'
   * @return null
   * @type null
   *
   */
  $.fbIframeAuthenticate = function (options) {
    if(!options) { options = {}; }
    var req_perms = '';
    if(options['permissions']) {
      req_perms = "&req_perms=" + options['permissions'].join(',');
    }
    var next = '';
    if(options['canvas_name']) {
      next = "&next=http://apps.facebook.com/"+options['canvas_name'];
    }
    var url = "http://www.facebook.com/login.php?api_key="+apiKey+''+next+"&display=popup&fbconnect=true"+req_perms;
    window.open(url);
  };
  
})(jQuery);
