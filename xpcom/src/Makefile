CPP   = g++
CPPFLAGS += -fno-rtti -fno-exceptions
 
# Change this to point at your Gecko SDK directory. 
GECKO_SDK_PATH = /Users/hideaki/gecko-sdk
XPIDL = $(GECKO_SDK_PATH)/bin/xpidl
 
# GCC only define which allows us to not have to #include mozilla-config 
# in every .cpp file.  If your not using GCC remove this line and add 
# #include "mozilla-config.h" to each of your .cpp files. 
GECKO_CONFIG_INCLUDE = -include mozilla-config.h 
 
GECKO_DEFINES  = -DXPCOM_GLUE
 
GECKO_INCLUDES = -I$(GECKO_SDK_PATH)/include 
 
GECKO_LDFLAGS =  -L$(GECKO_SDK_PATH)/lib -lxpcom -lxpcomglue -lxpcomglue_s \
                 -lnspr4      \
                 -lplds4      
FRAMEWORK_LDFLAGS = -framework CoreServices -framework Cocoa
IDL_FILE = ISummaryService.idl
XPT_FILE = ISummaryService.xpt
IDL_H_FILE = ISummaryService.h
CPP_FILES = SummaryService.M SummaryServiceModule.cpp 
DYLIB_FILE = libISummaryService.dylib

all: $(DYLIB_FILE) $(XPT_FILE)

$(IDL_H_FILE): ISummaryService.idl
	$(XPIDL) -m header -w -v -I $(GECKO_SDK_PATH)/idl -e $(IDL_H_FILE) ISummaryService.idl

$(XPT_FILE): ISummaryService.idl
	$(XPIDL) -m typelib -w -v -I $(GECKO_SDK_PATH)/idl -e $(XPT_FILE) ISummaryService.idl

$(DYLIB_FILE): $(CPP_FILES) $(IDL_H_FILE)
	$(CPP) -Wall -Os -dynamiclib -arch i386 -o $(DYLIB_FILE) $(GECKO_CONFIG_INCLUDE) $(GECKO_DEFINES) $(GECKO_INCLUDES) $(GECKO_LDFLAGS) $(FRAMEWORK_LDFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(CPP_FILES)
	chmod +x $(DYLIB_FILE)
 
clean: 
	rm $(DYLIB_FILE) $(XPT_FILE) $(IDL_H_FILE)
