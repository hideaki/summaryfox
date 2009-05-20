#ifndef _DICTIONARYAPP_H_
#define _DICTIONARYAPP_H_

#include "IDictionaryApp.h"

#define DICTIONARYAPP_CONTRACTID "@h5i.biz/XPCOM/IDictionaryApp;1"
#define DICTIONARYAPP_CLASSNAME "Looks Up OSX Dictionary"
#define DICTIONARYAPP_CID \
  {0xb369a37e, 0x0abe, 0x11dd, \
    { 0xba, 0x80, 0x83, 0xd6, 0x55, 0xd8, 0x95, 0x93 }}

class DictionaryApp : public IDictionaryApp
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IDICTIONARYAPP

  DictionaryApp();
  virtual ~DictionaryApp();
};


#endif //_DICTIONARYAPP_H_
