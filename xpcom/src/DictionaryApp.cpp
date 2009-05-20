#include <stdio.h>
#include <stdlib.h>
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

