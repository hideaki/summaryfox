/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is DictionaryFox.
 *
 * The Initial Developer of the Original Code is
 * Hideaki Hayashi.
 * Portions created by the Initial Developer are Copyright (C) 2008, 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

function DictionaryFox() {
  this.selectionWord = "";
  this.passHost = "chrome://dictionaryfox";
}

DictionaryFox.prototype = {
  load: function() {
    /* load preference service */
    this.prefService = Components.classes['@mozilla.org/preferences-service;1']
      .getService(Components.interfaces.nsIPrefService).getBranch("extensions.dictionaryfox.");

    this.initPasswordMon();
    this.setupShortcut();
    this.setupTwitter();
  },

  initPasswordMon: function() {
    if ("@mozilla.org/passwordmanager;1" in Components.classes) {
      //FF2 Password Manager
      this.passwordMan = Components.classes["@mozilla.org/passwordmanager;1"]
                         .createInstance(Components.interfaces.nsIPasswordManager);
    }
    else if ("@mozilla.org/login-manager;1" in Components.classes) {
      //FF3 Login Manager
      this.loginMan = Components.classes["@mozilla.org/login-manager;1"]
                      .getService(Components.interfaces.nsILoginManager);
    }
  },

  saveUserPass: function(user, pass) {
    this.removeUserPass();
    //username/password is unset
    if(user == "" || pass == "") return;

    if (this.passwordMan) {
      //FF2
      this.passwordMan.addUser(this.passHost, user, pass);
    }
    else if (this.loginMan) {
      //FF3
      var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
          Components.interfaces.nsILoginInfo,
          "init");
      var loginInfo = new nsLoginInfo(this.passHost, this.passHost, null, user, pass, "username", "password");
      this.loginMan.addLogin(loginInfo);
    }
  },

  removeUserPass: function() {
    if (this.passwordMan) {
      // for Password Manager
      var userpass = this.getUserPass();
      if (userpass != null)
        this.passwordMan.removeUser(this.passHost, userpass.user);
    }
    else if (this.loginMan) {
      // for Login Manager
      var logins = this.loginMan.findLogins({}, this.passHost, "", null);
      for (var i = 0; i < logins.length; ++i) 
        this.loginMan.removeLogin(logins[i]);
    }
  },

  getUserPass: function() {
    if (this.passwordMan) {
      // FF2 Password Manager
      var en = this.passwordMan.enumerator;
      while (en.hasMoreElements()) {
        try {
          var pass = en.getNext().QueryInterface(Components.interfaces.nsIPassword);
          if (pass.host == this.passHost) {
            // found!
            var res = new Object();
            res.user=pass.user;
            res.password=pass.password;
            return res;
          }
        } catch (ex) {
          //decrypting password failed. just keep looking.
          continue;
        }
      }
      return null;
    }
    else if (this.loginMan) {
      // FF3 Login Manager
      var logins = this.loginMan.findLogins({}, this.passHost, "", null);
      if (logins.length > 0) {
        var res = new Object();
        res.user=logins[0].username;
        res.password=logins[0].password;
        return res;
      }
      else
        return null;
    }
    return null;
  },

  setupShortcut: function() {
    var elem = document.getElementById("dictionaryfox-key-lookup");
    var pref = this.prefService.getCharPref("shortcut");
    var params = pref.split(/,/);

    if (params[0])
      elem.setAttribute("key", params[0]);
    if (params[1])
      elem.setAttribute("keycode", params[1]);
    elem.setAttribute("modifiers", params[2]);
  },

  setupTwitter: function() {
    this.twitterOn = this.prefService.getBoolPref("twitterOn");
    this.userpass = this.getUserPass();
  },

  setSelectionWord: function(event) {
    try {
      var target = document.commandDispatcher.focusedElement;
      /* another way I found to get target that did not work in case of shortcut key.
       * I'm keeping it here just in case.
       */
      //var target = event.explicitOriginalTarget;
      var selectionString = "";
      if ((target) && 
          ((target.nodeName.toUpperCase() == "TEXTAREA") ||
           (target.nodeName.toUpperCase() == "INPUT" && target.type == "text"))){
        /* get selection from a text box */
        selectionString = target.value.substring(target.selectionStart, target.selectionEnd);
      }else{
        /* get selection from regular document */
        var selection = window.content.getSelection();
        selectionString = selection.toString()
        if(event != null && event.rangeParent && selectionString == ""){
          /* try to get word under cursor */
          var range = document.createRange();
          var rangeStart = event.rangeOffset;
          var rangeEnd = event.rangeOffset;
          var ws = /[\s\.\,\?\:\"\'\(\)]/;
          range.setStart(event.rangeParent, event.rangeOffset);
          range.setEnd(event.rangeParent, event.rangeOffset);
          // now find beginning and end of word
          while(!ws.test(range.toString()[0]) && rangeStart >= 0) {
            rangeStart--;
            if(rangeStart >= 0)
              range.setStart(event.rangeParent, rangeStart);
          }
          // move forward one char again
          rangeStart++;
          range.setStart(event.rangeParent, rangeStart);

          while(!ws.test(range.toString().substr(-1,1))) {
            rangeEnd++;
            try {
              range.setEnd(event.rangeParent, rangeEnd);
            }
            catch(ex) {
              // dunno how to figure out if rangeEnd is too big?
              break;
            }
          }
          // move back one char again
          rangeEnd--;
          range.setEnd(event.rangeParent, rangeEnd);

          selectionString = range.toString();
        }
      }
      this.selectionWord = selectionString;
    } catch (err) {
      alert(err);
    }
    return;
  },

  lookupDictionary: function() {
    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      var myComponent = Components.classes['@h5i.biz/XPCOM/IDictionaryApp;1']
        .createInstance(Components.interfaces.IDictionaryApp);
      var res = myComponent.LookUp(encodeURI(this.selectionWord));
    } catch (err) {
      alert(err);
    }
    return;
  },

  onContextMenuSelect: function() {
    this.lookupDictionary();
    if (this.twitterOn) this.sendTwitter(); 
  },

  onLookupKey: function(event) {
    this.setSelectionWord(null);
    this.lookupDictionary();
    if (this.twitterOn) this.sendTwitter(); 
  },

  onConfigure: function() {
    window.openDialog("chrome://dictionaryfox/content/config.xul", 
                      "_blank",
                      "chrome,resizable=no,dependent=yes");
  },

  sendTwitter: function() {
    if(this.selectionWord == "") return;
    if(this.userpass == null) {
      alert("Username/Password is required to record history in Twitter.");
      return;
    }
    var params = "status=" + encodeURIComponent("looked up \"" + this.selectionWord + "\". #dictionaryfox");
    var request = new HttpRequest("https://twitter.com/statuses/update.json", params);
    request.setAuthorization(this.userpass.user, this.userpass.password);
    request.asyncOpen(null);
  }
}

//Base64 encoding based on public domain code by Tyler Akins -- http://rumkin.co

var Base64 = {
  keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  encode: function(input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output + this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) +
        this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);
    } while (i < input.length);

    return output;
  }
};

function HttpRequest(url, postData) {
  var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
  var uri = ioService.newURI(url, null, null);
  this.channel = ioService.newChannelFromURI(uri);
  this.httpChannel = this.channel.QueryInterface(Components.interfaces.nsIHttpChannel);
 
  if(postData != null) {
    var inputStream = Components.classes["@mozilla.org/io/string-input-stream;1"]
      .createInstance(Components.interfaces.nsIStringInputStream);
    inputStream.setData(postData, postData.length);
    var uploadChannel = this.channel.QueryInterface(Components.interfaces.nsIUploadChannel);
    uploadChannel.setUploadStream(inputStream, "application/x-www-form-urlencoded", -1);
    // order important - setUploadStream resets to PUT
    this.httpChannel.requestMethod = "POST";
  }
}

HttpRequest.prototype = {
  setRequestHeader: function(name, value) {
    this.httpChannel.setRequestHeader(name, value, false);
  },

  setAuthorization: function(user, pass) {
    this.setRequestHeader("Authorization", "Basic " + Base64.encode(user + ":" + pass), false);
  },

  asyncOpen: function(callback) {
    this.listener = new this.StreamListener(this, callback);
    this.channel.notificationCallbacks = this.listener;
    this.channel.asyncOpen(this.listener, null);
  }
};

HttpRequest.prototype.StreamListener = function (httpreq, callback) {
  this.mCallbackFunc = callback;
  this.mData = "";
  this.mHttpRequest = httpreq;
};

HttpRequest.prototype.StreamListener.prototype = {

  // nsIStreamListener
  onStartRequest: function (aRequest, aContext) {
    this.mData = "";
  },

  onDataAvailable: function (aRequest, aContext, aStream, aSourceOffset, aLength) {
    var scriptableInputStream = 
      Components.classes["@mozilla.org/scriptableinputstream;1"]
        .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptableInputStream.init(aStream);

    this.mData += scriptableInputStream.read(aLength);
  },

  onStopRequest: function (aRequest, aContext, aStatus) {
    if (Components.isSuccessCode(aStatus)) {
      // request was successfull
      if (this.mCallbackFunc) this.mCallbackFunc(aStatus, this.mData);
    } else {
      // request failed
      if (this.mCallbackFunc) this.mCallbackFunc(aStatus, null);
    }

    this.mHttpRequest.channel = null;
  },

  // nsIChannelEventSink
  onChannelRedirect: function (aOldChannel, aNewChannel, aFlags) {
    // if redirecting, store the new channel
    this.mHttpRequest.channel = aNewChannel;
  },

  // nsIInterfaceRequestor
  getInterface: function (aIID) {
    try {
      return this.QueryInterface(aIID);
    } catch (e) {
      throw Components.results.NS_NOINTERFACE;
    }
  },

  // nsIProgressEventSink (not implementing will cause annoying exceptions)
  onProgress : function (aRequest, aContext, aProgress, aProgressMax) { },
  onStatus : function (aRequest, aContext, aStatus, aStatusArg) { },

  // nsIHttpEventSink (not implementing will cause annoying exceptions)
  onRedirect : function (aOldChannel, aNewChannel) { },

  // we are faking an XPCOM interface, so we need to implement QI
  QueryInterface : function(aIID) {
    if (aIID.equals(Components.interfaces.nsISupports) ||
        aIID.equals(Components.interfaces.nsIInterfaceRequestor) ||
        aIID.equals(Components.interfaces.nsIChannelEventSink) || 
        aIID.equals(Components.interfaces.nsIProgressEventSink) ||
        aIID.equals(Components.interfaces.nsIHttpEventSink) ||
        aIID.equals(Components.interfaces.nsIStreamListener))
      return this;

    throw Components.results.NS_NOINTERFACE;
  }
};

var gDictionaryFox = new DictionaryFox();
document.addEventListener("contextmenu", function(e) { gDictionaryFox.setSelectionWord(e); }, true);
window.addEventListener("load", function(e) { gDictionaryFox.load(); }, false);
