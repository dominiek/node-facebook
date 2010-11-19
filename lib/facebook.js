
// Express - Facebook - By Dominiek ter Heide (MIT Licensed)

sys = require('sys')
hashlib = require('hashlib')

function FBSession(userId) {
    this.userId = userId;
};

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

exports.Facebook = function(options) {
    options = options || {};
    var apiKey    = options['apiKey']
    var apiSecret = options['apiSecret']

    return function(req, res, next) {
        /**
         * Try authenticating by verifying Facebook data in GET params and cookie
         *
         * @return {FBSession}
         * @api public
         */
        req.fbAuthenticate = function() {
            var cookies = req.cookies;
            var params = req.params;

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
        };

        /**
         * Find or create Facebook session based on stored session, GET params or cookie
         * @return {FBSession}
         * @api public
         */
        req.fbSession = function() {
            var session = req.session.fbSession;
            if(session && session.userId)
                return session;
            if(req.fbAuthenticate()) {
                var fbUserId = req.params['fb_sig_user'] ? req.params['fb_sig_user'] : req.cookies[apiKey + '_user']
                req.session.fbSession = new FBSession(fbUserId);
                return req.session.fbSession;
            }
            return null;
        };
        /**
         * Logout
         * @return null
         * @api public
         */
        req.fbLogout = function() {
            req.session.fbSession = null
            return null
        };
        next();
    };
};
