
(function($){
  
  // Note: these variables are cache, validation is still server-side
  var authenticated = null;
  var authenticatedFbSession = null;
  var apiKey = null;
  var fbOptions = null;
  
  $.fbInit = function (api_key, options) {
    apiKey = api_key;
    fbOptions = options || {};
    FB_RequireFeatures(["Api"], function() {
      FB.Facebook.init(api_key, fbOptions['xd_receiver'] || '/xd_receiver.htm');
    });
  };
  
  $.fbConnect = function(options, callback) {
    options = options || {};
    if(!options['include']) {
      options['include'] = ['name', 'pic'];
    }
    FB.Connect.requireSession(function () {
      FB.Facebook.apiClient.fql_query("SELECT " + options['include'].join(', ') + " FROM user WHERE uid="+$.fbCookie('user'), function(rows) {
        $.post("/fbSession", rows[0], function (fbSession) {
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
  };
  
  $.fbLogout = function (callback) {
    FB.Connect.logout(function () {
       $.post("/fbLogout", {}, function () {
         callback();
       }, 'json');
    });
  };
  
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
  
})(jQuery);
