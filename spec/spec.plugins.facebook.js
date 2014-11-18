
describe 'Express'
  before_each
    facebook = require('facebook')
    var express = require('express')
    var querystring = require('querystring')
    app = express.createServer();
    app.use(facebook.Facebook, {
      apiKey: 'e1249f7d4bc25b8f90e5c9c7523e3ee1', 
      apiSecret: '4ae45734dd66fa85c7b189fc2d7d5b4c'
    })
    
    validCookies = {"e1249f7d4bc25b8f90e5c9c7523e3ee1": querystring.stringify({
        "sig" : "e",
        "user":"687215451",
        "ss":"lWYbyFp0GP8e7BgPa1aLDg__",
        "session_key":"3.LIysipyTte6aXFBcStEixg__.3600.1267714800-687215451",
        "expires":"1267714800"
    })}
    
    tamperedCookies = {
      "e1249f7d4bc25b8f90e5c9c7523e3ee1": "5b820bb72e780318acb26ff375db4cc9",
      "e1249f7d4bc25b8f90e5c9c7523e3ee1_user": "687215453",
      "e1249f7d4bc25b8f90e5c9c7523e3ee1_ss": "lWYbyFp0GP8e7BgPa1aLDg__",
      "e1249f7d4bc25b8f90e5c9c7523e3ee1_session_key": "3.LIysipyTte6aXFBcStEixg__.3600.1267714800-687215451",
      "e1249f7d4bc25b8f90e5c9c7523e3ee1_expires": "1267714800"
    }
    
    validParams = {
      "fb_sig_in_iframe": 1,
      "fb_sig_iframe_key": "7d0665438e81d8eceb98c1e31fca80c1",
      "fb_sig_locale": "en_US",
      "fb_sig_in_new_facebook": 1,
      "fb_sig_time": 1267707311.2722,
      "fb_sig_added": 1,
      "fb_sig_profile_update_time": 1257283845,
      "fb_sig_expires": 1267711200,
      "fb_sig_user": 687215451,
      "fb_sig_session_key": "2._iAVUxKTc6ASHM_UQJZddA__.3600.1267711200-687215451",
      "fb_sig_ss": "I667xeojG4lgcEfzc5TcZw__",
      "fb_sig_cookie_sig": "e379d598512da632c49946041a3a6847",
      "fb_sig_ext_perms": "auto_publish_recent_activity",
      "fb_sig_api_key": "e1249f7d4bc25b8f90e5c9c7523e3ee1",
      "fb_sig_app_id": 341436568738,
      "fb_sig": "24188c7a57d420ad27beba0f22d00289"
    }
    
    tamperedParams = {
      "fb_sig_in_iframe": 1,
      "fb_sig_iframe_key": "7d0665438e81d8eceb98c1e31fca80c1",
      "fb_sig_locale": "en_US",
      "fb_sig_in_new_facebook": 1,
      "fb_sig_time": 1267707311.2722,
      "fb_sig_added": 1,
      "fb_sig_profile_update_time": 1257283845,
      "fb_sig_expires": 1267711200,
      "fb_sig_user": 687215448,
      "fb_sig_session_key": "2._iAVUxKTc6ASHM_UQJZddA__.3600.1267711200-687215451",
      "fb_sig_ss": "I667xeojG4lgcEfzc5TcZw__",
      "fb_sig_cookie_sig": "e379d598512da632c49946041a3a6847",
      "fb_sig_ext_perms": "auto_publish_recent_activity",
      "fb_sig_api_key": "e1249f7d4bc25b8f90e5c9c7523e3ee1",
      "fb_sig_app_id": 341436568738,
      "fb_sig": "24188c7a57d420ad27beba0f22d00289"
    }
  end
  
  describe 'Facebook'
  
    describe 'getFingerprintForParams'
    
      it 'should return a well formatted fingerprint'
        var fingerprint = facebook.getFingerprintForParams(validParams)
        fingerprint.should.eql("added=1api_key=e1249f7d4bc25b8f90e5c9c7523e3ee1app_id=341436568738cookie_sig=e379d598512da632c49946041a3a6847expires=1267711200ext_perms=auto_publish_recent_activityiframe_key=7d0665438e81d8eceb98c1e31fca80c1in_iframe=1in_new_facebook=1locale=en_USprofile_update_time=1257283845session_key=2._iAVUxKTc6ASHM_UQJZddA__.3600.1267711200-687215451ss=I667xeojG4lgcEfzc5TcZw__time=1267707311.2722user=687215451")   
      end
      
    end
    
    describe 'getFingerprintForCookie'
    
      it 'should return a well formatted fingerprint'
        var fingerprint = facebook.getFingerprintForCookie('e1249f7d4bc25b8f90e5c9c7523e3ee1', validCookies)
fingerprint.should.eql({fingerprint: "expires=1267714800session_key=3.LIysipyTte6aXFBcStEixg__.3600.1267714800-687215451ss=lWYbyFp0GP8e7BgPa1aLDg__user=687215451", sig: "e"})
      end
      
    end
    
    describe 'Request'
    
      describe 'fbAuthenticate'
      
        it 'should return true on a request with a valid cookie'
          get('/fbSession', function () {
            this.cookies = validCookies
            return this.fbAuthenticate() + ''
          })
          get('/fbSession', {}).body.should.eql 'true'
        end
        
        it 'should return false on a request with a tampered cookie'
          get('/fbSession', function () {
            this.cookies = tamperedCookies
            return this.fbAuthenticate() + ''
          })
          get('/fbSession', {}).body.should.eql 'false'
        end
        
        it 'should return true on a request with valid params'
          get('/fbSession', function () {
            this.params.get = validParams
            return this.fbAuthenticate() + ''
          })
          get('/fbSession', {}).body.should.eql 'true'
        end
        
        it 'should return false on a request with tampered params'
          get('/fbSession', function () {
            this.params.get = tamperedParams
            return this.fbAuthenticate() + ''
          })
          get('/fbSession', {}).body.should.eql 'false'
        end
        
      end
      
    end    
      
  end
end