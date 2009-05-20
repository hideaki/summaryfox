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
 * Portions created by the Initial Developer are Copyright (C) 2008
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
  this.selectionWord="";
}

DictionaryFox.prototype = {
  load: function() {
    /* load preference service */
    this.prefService = Components.classes['@mozilla.org/preferences-service;1']
      .getService(Components.interfaces.nsIPrefService).getBranch("extensions.dictionaryfox.");

    this.setupShortcut();
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

  onLookupKey: function(event) {
    //Maybe event is unnecessary here.
    this.setSelectionWord(event);
    this.lookupDictionary();
  },

  onConfigure: function() {
    window.openDialog("chrome://dictionaryfox/content/config.xul", 
                      "_blank",
                      "chrome,resizable=no,dependent=yes");
  }
}

var gDictionaryFox = new DictionaryFox();
document.addEventListener("contextmenu", function(e) { gDictionaryFox.setSelectionWord(e); }, true);
window.addEventListener("load", function(e) { gDictionaryFox.load(); }, false);
