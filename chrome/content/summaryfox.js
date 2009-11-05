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
 * The Original Code is SummaryFox.
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

function SummaryFox() {
  this.selectionWord = "";
  this.passHost = "chrome://summaryfox";
}

SummaryFox.prototype = {
  load: function() {
    /* load preference service */
    this.prefService = Components.classes['@mozilla.org/preferences-service;1']
      .getService(Components.interfaces.nsIPrefService).getBranch("extensions.summaryfox.");
  },

  updateCursorLoc: function(event) {
    this.rangeParent = event.rangeParent;
    this.rangeOffset = event.rangeOffset;
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
        if(this.rangeParent && selectionString == ""){
          /* try to get word under cursor */
          var range = document.createRange();
          var rangeStart = this.rangeOffset;
          var rangeEnd = this.rangeOffset;
          var ws = /[\s\.\,\?\:\"\'\(\)]/;
          range.setStart(this.rangeParent, this.rangeOffset);
          range.setEnd(this.rangeParent, this.rangeOffset);
          // now find beginning and end of word
          while(!ws.test(range.toString()[0]) && rangeStart >= 0) {
            rangeStart--;
            if(rangeStart >= 0)
              range.setStart(this.rangeParent, rangeStart);
          }
          // move forward one char again
          rangeStart++;
          range.setStart(this.rangeParent, rangeStart);

          while(!ws.test(range.toString().substr(-1,1))) {
            rangeEnd++;
            try {
              range.setEnd(this.rangeParent, rangeEnd);
            }
            catch(ex) {
              // dunno how to figure out if rangeEnd is too big?
              break;
            }
          }
          // move back one char again
          rangeEnd--;
          range.setEnd(this.rangeParent, rangeEnd);

          selectionString = range.toString();
        }
      }
      this.selectionWord = selectionString;
    } catch (err) {
      alert(err);
    }
    return;
  },

  summarize: function() {
    try {
      netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
      var myComponent = Components.classes['@h5i.biz/XPCOM/ISummaryService;1']
        .createInstance(Components.interfaces.ISummaryService);
      var res = myComponent.Summarize(unescape(encodeURI(this.selectionWord)));
    } catch (err) {
      alert(err);
    }
    return;
  },

  onContextMenuSelect: function() {
    this.summarize();
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

var gSummaryFox = new SummaryFox();
document.addEventListener("mousemove", function(e) { gSummaryFox.updateCursorLoc(e); }, true);
document.addEventListener("mousedown", function(e) { gSummaryFox.updateCursorLoc(e); }, true);
document.addEventListener("contextmenu", function(e) { gSummaryFox.setSelectionWord(e); }, true);
window.addEventListener("load", function(e) { gSummaryFox.load(); }, false);
