ZIP = zip

XPT_FILE_SRC = xpcom/src/IDictionaryApp.xpt
XPT_FILE_SRC_SRC = xpcom/src/IDictionaryApp.idl
XPT_FILE = components/IDictionaryApp.xpt
DYLIB_FILE = components/libIDictionaryApp.dylib
DYLIB_FILE_SRC = xpcom/src/libIDictionaryApp.dylib
DYLIB_FILE_SRC_SRC = xpcom/src/IDictionaryApp.idl xpcom/src/DictionaryApp.cpp xpcom/src/DictionaryApp.h xpcom/src/DictionaryAppModule.cpp

FILES = install.rdf chrome.manifest chrome/content/config.js chrome/content/config.xul chrome/content/dictionaryfox.js chrome/content/dictionaryfox.xul defaults/preferences/dictionaryfox.js

TARGET = dictionaryfox.xpi

$(TARGET): $(FILES) $(XPT_FILE) $(DYLIB_FILE)
	$(ZIP) -r $(TARGET) chrome chrome.manifest components defaults install.rdf

$(XPT_FILE): $(XPT_FILE_SRC)
	cp $(XPT_FILE_SRC) $(XPT_FILE)

$(XPT_FILE_SRC): $(XPT_FILE_SRC_SRC)
	cd xpcom/src; make

$(DYLIB_FILE): $(DYLIB_FILE_SRC)
	cp $(DYLIB_FILE_SRC) $(DYLIB_FILE)

$(DYLIB_FILE_SRC): $(DYLIB_FILE_SRC_SRC)
	cd xpcom/src; make

clean: 
	rm $(TARGET) $(DYLIB_FILE) $(XPT_FILE); cd xpcom/src; make clean
