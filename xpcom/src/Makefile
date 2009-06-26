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
FRAMEWORK_LDFLAGS = -framework CoreServices
IDL_FILE = IDictionaryApp.idl
XPT_FILE = IDictionaryApp.xpt
IDL_H_FILE = IDictionaryApp.h
CPP_FILES = DictionaryApp.cpp DictionaryAppModule.cpp 
DYLIB_FILE = libIDictionaryApp.dylib

all: $(DYLIB_FILE) $(XPT_FILE)

$(IDL_H_FILE): IDictionaryApp.idl
	$(XPIDL) -m header -w -v -I $(GECKO_SDK_PATH)/idl -e $(IDL_H_FILE) IDictionaryApp.idl

$(XPT_FILE): IDictionaryApp.idl
	$(XPIDL) -m typelib -w -v -I $(GECKO_SDK_PATH)/idl -e $(XPT_FILE) IDictionaryApp.idl

$(DYLIB_FILE): $(CPP_FILES) $(IDL_H_FILE)
	$(CPP) -Wall -Os -dynamiclib -o $(DYLIB_FILE) $(GECKO_CONFIG_INCLUDE) $(GECKO_DEFINES) $(GECKO_INCLUDES) $(GECKO_LDFLAGS) $(FRAMEWORK_LDFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(CPP_FILES)
	chmod +x $(DYLIB_FILE)
 
clean: 
	rm $(DYLIB_FILE) $(XPT_FILE) $(IDL_H_FILE)
