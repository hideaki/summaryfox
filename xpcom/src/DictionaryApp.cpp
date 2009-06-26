#include <stdio.h>
#include <stdlib.h>
#include <CoreServices/CoreServices.h>
#include "DictionaryApp.h"

NS_IMPL_ISUPPORTS1(DictionaryApp, IDictionaryApp)

DictionaryApp::DictionaryApp()
{
  /* member initializers and constructor code */
}

DictionaryApp::~DictionaryApp()
{
  /* destructor code */
}

NS_IMETHODIMP DictionaryApp::LookUp(const char *a)
{
  char buf[256];
  snprintf(buf, 256, "open dict://%s", a);
  system(buf);
  return NS_OK;
}

static void lookup(const char *instr, char **outstr){
  static char buf[4000];
  CFStringRef strref1, strref2; 
  strref1 = CFStringCreateWithCString(NULL, instr, kCFStringEncodingUTF8); 
  CFRange range = CFRangeMake(0, CFStringGetLength(strref1));
  if(strref2 = DCSCopyTextDefinition(NULL, strref1, range)){
    if(!CFStringGetCString(strref2, buf, sizeof(buf), kCFStringEncodingUTF8)){
      strcpy(buf,"");
    }
    CFRelease(strref2);
  }
  else{
    strcpy(buf,"");
  }
  CFRelease(strref1);
  *outstr = buf;
  return;
}

NS_IMETHODIMP DictionaryApp::GetDefinition(const char *a, char **_retval)
{
  lookup(a, _retval);
  return NS_OK;
}

