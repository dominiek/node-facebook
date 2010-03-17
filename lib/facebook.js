
// Express - Facebook - By Dominiek ter Heide (MIT Licensed)

sys = require('sys')
hashlib = require('hashlib')

exports.FBSession = Class({
  init: function (userId) {
    this.userId = userId;
  }
});

exports.getFingerprintForCookie = function (apiKey, cookies) {
  var fields = ['expires', 'session_key', 'ss', 'user'];
  var fingerprint = '';
  fields.sort();
  for(var i in fields) {
    fingerprint += fields[i]+'='+cookies[apiKey + '_' + fields[i]];
  }
  return fingerprint;
}

exports.getFingerprintForParams = function (params) {
  var fields = [];
  for(var i in params) {
    if(i.match(/^fb_sig_/)) {
      fields.push(i);
    }
  }
  fields.sort();
  var fingerprint = '';
  fields.sort();
  for(var i in fields) {
    fingerprint += fields[i].replace(/^fb_sig_/, '')+'='+params[fields[i]];
  }
  return fingerprint;
}

// --- Facebook

exports.Facebook = Plugin.extend({
  extend: {
    
    /**
     * Initialize extensions.
     */
    
    init: function(options) {
      var apiKey = options['apiKey']
      var apiSecret = options['apiSecret']
      
      // --- Internal methods
      
      Request.include({

        /**
         * Find or create Facebook session based on stored session, GET params or cookie
         *
         * @param  {hash} options
         * @return {FBSession}
         * @api public
         */

        fbSession: function(options) {
          var session = this.session.fbSession;
          if(session && session.userId)
            return session;
          if(this.fbAuthenticate()) {
            var fbUserId = this.param('fb_sig_user') ? this.param('fb_sig_user') : this.cookie(apiKey + '_user')
            this.session.fbSession = new exports.FBSession(fbUserId);
            return this.session.fbSession;
          }
          return null;
        },
        
        /**
         * Try authenticating by verifying Facebook data in GET params and cookie
         *
         * @param  {hash} options
         * @return {FBSession}
         * @api public
         */

        fbAuthenticate: function(options) {
          var cookies = this.cookies;
          var params = this.params.get;
          
          // Get a fingerprint and signature
          var fingerprint = null;
          var signature = null;
          if(cookies && cookies[apiKey]) {
            fingerprint = exports.getFingerprintForCookie(apiKey, cookies)
            signature = cookies[apiKey]
          }
          if(params && params['fb_sig']) {
            fingerprint = exports.getFingerprintForParams(params)
            signature = params['fb_sig']
          }
          if(!fingerprint)
            return null;
          
          // Verify signature using apiSecret
          var expected_signature = hashlib.md5(fingerprint+apiSecret);
          var valid = (expected_signature === signature)
          if(!valid)
            sys.puts("Warning, invalid signature: "+fingerprint)
          return valid
        },
        
        /**
         * Logout
         * @return null
         * @api public
         */
        fbLogout: function() {
          this.session.fbSession = null
          return null
        },
      })
    }
  }
})