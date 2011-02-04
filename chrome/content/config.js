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
 * The Original Code is Twitter Notifier.
 *
 * The Initial Developer of the Original Code is
 * Kazuho Okui.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):Hideaki Hayashi
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

const DictionaryFoxConfig = {

  vkNames: [],
  platformKeys: {},
  localKeys: {},
 
  onLoad: function() {
    /* load preference service */
    this.prefService = Components.classes['@mozilla.org/preferences-service;1']
      .getService(Components.interfaces.nsIPrefService).getBranch("extensions.dictionaryfox.");

    this.localeKeys = document.getElementById("localeKeys");

    var platformKeys = document.getElementById("platformKeys");
    this.platformKeys.shift   = platformKeys.getString("VK_SHIFT");
    this.platformKeys.meta    = platformKeys.getString("VK_META");
    this.platformKeys.alt     = platformKeys.getString("VK_ALT");
    this.platformKeys.control = platformKeys.getString("VK_CONTROL");
    this.platformKeys.sep     = platformKeys.getString("MODIFIER_SEPARATOR");

    pref = Components.classes['@mozilla.org/preferences-service;1']
     .getService(Components.interfaces.nsIPrefService);

    switch (pref.getIntPref("ui.key.accelKey")) {
    case 17:
      this.platformKeys.accel = this.platformKeys.control;
      break;
    case 18: 
      this.platformKeys.accel = this.platformKeys.alt;
      break;
    case 224:
      this.platformKeys.accel = this.platformKeys.meta;
      break;
    default:
      this.platformKeys.accel = (window.navigator.platform.search("Mac") == 0 ?
                                 this.platformKeys.meta : this.platformKeys.control);
    }

    for (var property in KeyEvent) {
      this.vkNames[KeyEvent[property]] = property.replace("DOM_","");
    }
    this.vkNames[8] = "VK_BACK";

    /* display current shortcut in textbox */
    var pref = this.prefService.getCharPref("shortcut");
    var param = pref.split(/,/);
    var e = document.getElementById("dictionaryfox-key-lookup");
    e.value = this.getPrintableKeyName(param[2], param[0], param[1]);
    e.initialValue = e.pref = pref;

    /* display twitter account info */
    var twitterOn = this.prefService.getBoolPref("twitterOn");
    var shorturlOn = this.prefService.getBoolPref("shorturlOn");
    /* the statement after || covers the case where config.xul is
     * poped up from Add-ons window
     */
    var dictionaryFox = window.opener.gDictionaryFox || window.opener.opener.gDictionaryFox;
    var userpass = dictionaryFox.getUserPass();
    var twitelem = document.getElementById("dictionaryfox-twitter-on");
    var shorturlelem = document.getElementById("dictionaryfox-shorturl-on");
    var userelem = document.getElementById("dictionaryfox-twitter-username");
    var passelem = document.getElementById("dictionaryfox-twitter-password");
    twitelem.checked = twitterOn;
    shorturlelem.checked = shorturlOn;
    shorturlelem.disabled = !twitterOn;
    userelem.value = userpass == null ? "" : userpass.user;
    passelem.value = userpass == null ? "" : userpass.password;
  },

  recognize: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var modifiers = [];
    if(e.altKey)   modifiers.push("alt");
    if(e.ctrlKey)  modifiers.push("control");
    if(e.metaKey)  modifiers.push("meta");
    if(e.shiftKey) modifiers.push("shift");

    modifiers = modifiers.join(" ");

    var key = "";
    var keycode = "";
    if(e.charCode) {
      key = String.fromCharCode(e.charCode).toUpperCase();
    }
    else { 
      keycode = this.vkNames[e.keyCode];
      if(!keycode) return;
    }

    var val = this.getPrintableKeyName(modifiers, key, keycode);
    if (val) {
      e.target.value = val;
      e.target.pref = key + "," + keycode + "," + modifiers;
    }
  },

  getPrintableKeyName: function(modifiers,key,keycode) {
    if(modifiers == "shift,alt,control,accel" && keycode == "VK_SCROLL_LOCK") return "";

    if (!modifiers && !keycode)
      return "";

    var val = "";
    if(modifiers) {
      val = modifiers.replace(/^[\s,]+|[\s,]+$/g,"").split(/[\s,]+/g).join(this.platformKeys.sep);
    }

    var   mod = ["alt", "shift", "control", "meta", "accel"];
    for (var i in mod) {
      val = val.replace(mod[i], this.platformKeys[mod[i]]);
    }

    if (val)
      val += this.platformKeys.sep;

    if(key) {
      val += key;
    }
    if(keycode) {
      try {
        val += this.localeKeys.getString(keycode);
      }
      catch(e) {
        val += keycode;
      }
    }

    return val;
  },

  onConfigOk: function() {
    var keyelem = document.getElementById("dictionaryfox-key-lookup");
    var twitelem = document.getElementById("dictionaryfox-twitter-on");
    var shorturlelem = document.getElementById("dictionaryfox-shorturl-on");
    var userelem = document.getElementById("dictionaryfox-twitter-username");
    var passelem = document.getElementById("dictionaryfox-twitter-password");
    if (twitelem.checked == true && (userelem.value == "" || passelem.value == "")) {
      alert("To record history, Twitter username/password is required.");
      return false;
    }
    this.prefService.setCharPref("shortcut", keyelem.pref);
    if (keyelem.pref != keyelem.initialValue) {
      alert("New shortcut key affects only new windows.");
    }
    this.prefService.setBoolPref("twitterOn", twitelem.checked);
    this.prefService.setBoolPref("shorturlOn", shorturlelem.checked);
    /* the statement after || covers the case where config.xul is
     * poped up from Add-ons window
     */
    var dictionaryFox = window.opener.gDictionaryFox || window.opener.opener.gDictionaryFox;
    dictionaryFox.saveUserPass(userelem.value, passelem.value);
    /* set saved info into runtime */
    dictionaryFox.setupShortcut();
    dictionaryFox.setupTwitter();
    return true;
  },

  onCancel: function() {
  },

  onTwitterCheckboxClick: function() {
    var twitelem = document.getElementById("dictionaryfox-twitter-on");
    var shorturlelem = document.getElementById("dictionaryfox-shorturl-on");
    shorturlelem.disabled = twitelem.checked;
  }
}
