ZIP = zip

XPT_FILE_SRC = xpcom/src/ISummaryService.xpt
XPT_FILE_SRC_SRC = xpcom/src/ISummaryService.idl
XPT_FILE = components/ISummaryService.xpt
DYLIB_FILE = components/libISummaryService.dylib
DYLIB_FILE_SRC = xpcom/src/libISummaryService.dylib
DYLIB_FILE_SRC_SRC = xpcom/src/ISummaryService.idl xpcom/src/SummaryService.M xpcom/src/SummaryService.h xpcom/src/SummaryServiceModule.cpp

FILES = install.rdf chrome.manifest chrome/content/config.js chrome/content/config.xul chrome/content/summaryfox.js chrome/content/summaryfox.xul defaults/preferences/summaryfox.js

TARGET = summaryfox.xpi

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
