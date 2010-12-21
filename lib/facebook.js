
// Express - Facebook - By Dominiek ter Heide (MIT Licensed)

var sys = require('sys')
var base64 = require('base64')
var crypto = require('crypto')
var querystring = require('querystring')

function FBSession(userId) {
    this.userId = userId;
};

exports.getFingerprintForCookie = function (apiKey, cookies) {
  var values = querystring.parse(cookies[apiKey]);
  var keys = [];
  for (var i in values)
    keys.push(i);
  var fingerprint = '';
  keys.sort();
  keys.forEach(function(key) {
    if (key != 'sig')
      fingerprint += key +'='+ values[key];
  });
  return {fingerprint: fingerprint, sig: values['sig']};
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
            var params = req.query;

            // Get a fingerprint and signature
            var fingerprint = null;
            var signature = null;

            if(cookies && cookies['fbs_'+apiKey]) {
                var r = exports.getFingerprintForCookie('fbs_'+ apiKey, cookies)
                fingerprint = r.fingerprint
                signature = r.sig
            }
            if(params && params['fb_sig']) {
                fingerprint = exports.getFingerprintForParams(params)
                signature = params['fb_sig']
            }
            if(!fingerprint)
                return null;

            // Verify signature using apiSecret
            var hash = crypto.createHash('md5')
            hash.update(fingerprint+apiSecret)
            var expected_signature = hash.digest('hex')
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
                var fbUserId = req.query['fb_sig_user'] ? req.query['fb_sig_user'] : querystring.parse(req.cookies['fbs_'+apiKey])['uid']
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
