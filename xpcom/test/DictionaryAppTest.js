function DictionaryAppTest() {
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		const cid = "@h5i.biz/XPCOM/IDictionaryApp;1";
		obj = Components.classes[cid].createInstance();
		obj = obj.QueryInterface(Components.interfaces.IDictionaryApp);
	} catch (err) {
		alert(err);
		return;
	}
    textval = document.getElementById("test").value
	obj.LookUp(encodeURI(textval));
	alert(textval + ":\n" + decodeURIComponent(escape(obj.GetDefinition(unescape(encodeURI(textval))))));
}
